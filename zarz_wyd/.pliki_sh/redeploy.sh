#!/opt/homebrew/bin/bash
set -e

services=(user category budget expense investment report notifications account)

echo "🔨 Budujowanie obrazów..."
for s in "${services[@]}"; do
  docker build -t ${s}-service:local ./${s}_service
done

echo "📦 Ładowanie obrazów do klastra Minikube..."
for s in "${serservices[@]}"; do
  minikube image load ${s}-service:local
done

echo "🔁 Restartujowanie deploymentów..."
kubectl rollout restart deployment

echo "✅ Obrazy i deploymenty zresetowane"