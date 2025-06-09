#!/opt/homebrew/bin/bash

set -e

echo "Applying DB..."
kubectl apply -f k8s/secrets/postgres-init-configmap.yaml

echo "🔐 Applying Secrets..."
kubectl apply -f k8s/secrets/

echo "💾 Applying Volumes (PVC)..."
kubectl apply -f k8s/volumes/

echo "🚀 Applying Deployments..."
kubectl apply -f k8s/deployments/

echo "🔗 Applying Services..."
kubectl apply -f k8s/services/

echo "🌐 Applying Ingress..."
kubectl apply -f k8s/ingress/

echo "📈 Applying Autoscalers..."
kubectl apply -f k8s/autoscaling/

echo "✅ Wszystkie zasoby zostały wdrożone"