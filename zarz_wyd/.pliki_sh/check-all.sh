#!/opt/homebrew/bin/bash

set -e

echo "🔍 Sprawdzam status klastra..."
kubectl cluster-info || { echo "❌ Kubeconfig nie działa"; exit 1; }

echo -e "\n📦 Pody:"
kubectl get pods

echo -e "\n🚀 Deploymenty:"
kubectl get deployments

echo -e "\n🔗 Service’y:"
kubectl get services

echo -e "\n🌐 Ingress:"
kubectl get ingress

echo -e "\n📈 Autoskalery (HPA):"
kubectl get hpa

echo -e "\n📡 Testuję adres IP Minikube..."
IP=$(minikube ip)
echo "Minikube IP: $IP"

echo -e "\n🧪 Testuję endpointy healthcheck przez Ingress:"
declare -a services=("user" "budget" "report" "category" "account" "notifications" "expense" "investment")

for svc in "${services[@]}"; do
  echo -n " - /$svc/check/health: "
  curl -s -o /dev/null -w "%{http_code}" http://local.test/$svc/check/health
  echo ""
done

echo -e "\n📂 Sprawdzam Metrics Server:"
kubectl top pods || echo "❗ Uwaga: metrics-server może nie działać (potrzebny dla HPA)"

echo -e "\n✅ Sprawdzenie zakończone"