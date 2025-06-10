#!/opt/homebrew/bin/bash

set -e
mkdir -p k8s/{deployments,services,secrets,volumes,autoscaling,ingress}

# === Definicje ===
declare -A ports=(
  [user]=4000
  [category]=4001
  [budget]=4002
  [expense]=4003
  [investment]=4004
  [report]=4005
  [notifications]=4006
  [account]=4007
)

# === Sekrety JWT i PostgreSQL ===
cat <<EOF > k8s/secrets/jwt-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: jwt-secret
type: Opaque
stringData:
  jwt: superbezpiecznytest123
EOF

cat <<EOF > k8s/secrets/postgres-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_PASSWORD: postgres
EOF

# === PVC ===
cat <<EOF > k8s/volumes/postgres-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
EOF

cat <<EOF > k8s/volumes/mongo-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
EOF

# === Mongo i PostgreSQL Deployment + Service ===
# === init.sql dla Postgresa ===
cat <<EOF > k8s/init.sql
CREATE DATABASE user_db;
CREATE DATABASE category_db;
EOF

kubectl create configmap postgres-init --from-file=init.sql --dry-run=client -o yaml > k8s/secrets/postgres-init-configmap.yaml
kubectl apply -f k8s/secrets/postgres-init-configmap.yaml

# === Deployment z mountem init.sql ===
cat <<EOF > k8s/deployments/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: POSTGRES_PASSWORD
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: postgres-vol
            - mountPath: /docker-entrypoint-initdb.d/
              name: init-volume
      volumes:
        - name: postgres-vol
          persistentVolumeClaim:
            claimName: postgres-pvc
        - name: init-volume
          configMap:
            name: postgres-init
EOF

cat <<EOF > k8s/services/postgres.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
EOF

cat <<EOF > k8s/deployments/mongo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
        - name: mongo
          image: mongo:5
          ports:
            - containerPort: 27017
          volumeMounts:
            - mountPath: /data/db
              name: mongo-vol
      volumes:
        - name: mongo-vol
          persistentVolumeClaim:
            claimName: mongo-pvc
EOF

cat <<EOF > k8s/services/mongo.yaml
apiVersion: v1
kind: Service
metadata:
  name: mongo
spec:
  selector:
    app: mongo
  ports:
    - port: 27017
      targetPort: 27017
EOF

# === Mikroserwisy ===
for svc in "${!ports[@]}"; do
  port="${ports[$svc]}"
  cat <<EOF > k8s/deployments/${svc}-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${svc}-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${svc}-service
  template:
    metadata:
      labels:
        app: ${svc}-service
    spec:
      containers:
        - name: ${svc}
          image: ${svc}-service:local
          ports:
            - containerPort: ${port}
          env:
            - name: PORT
              value: "${port}"
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: jwt
$( [[ "$svc" == "user" || "$svc" == "category" ]] && echo "            - name: DB_HOST
              value: \"postgres\"
            - name: DB_USER
              value: \"postgres\"
            - name: DB_PASS
              value: \"postgres\"
            - name: DB_NAME
              value: \"${svc}_db\"" )
$( [[ "$svc" != "user" && "$svc" != "category" ]] && echo "            - name: MONGO_URI
              value: \"mongodb://mongo:27017/${svc}_db\"" )
EOF

  cat <<EOF > k8s/services/${svc}-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ${svc}-service
spec:
  selector:
    app: ${svc}-service
  ports:
    - port: ${port}
      targetPort: ${port}
  type: ClusterIP
EOF
done

# === Ingress ===
cat <<EOF > k8s/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microservices-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: local.test
    http:
      paths:
$(for svc in "${!ports[@]}"; do
  echo "      - path: /${svc}/"
  echo "        pathType: Prefix"
  echo "        backend:"
  echo "          service:"
  echo "            name: ${svc}-service"
  echo "            port:"
  echo "              number: ${ports[$svc]}"
done)
EOF

# === HPA ===
for svc in user budget report; do
cat <<EOF > k8s/autoscaling/${svc}-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${svc}-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${svc}-service
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
EOF
done

echo "✅ Pliki YAML wygenerowane w katalogu ./k8s"