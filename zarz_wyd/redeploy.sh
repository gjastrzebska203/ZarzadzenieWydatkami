#!/opt/homebrew/bin/bash
set -e

services=(user category budget expense investment report notifications account)

echo "🔨 Buduję obrazy..."
for s in "${services[@]}"; do
  docker build -t ${s}-service:local ./${s}_service
done

echo "📦 Ładuję obrazy do klastra Minikube..."
for s in "${services[@]}"; do
  minikube image load ${s}-service:local
done

echo "🔁 Restartuję deploymenty..."
kubectl rollout restart deployment

echo "✅ Obrazy i deploymenty zresetowane"