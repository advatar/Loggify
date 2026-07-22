# Helm deployment

```sh
kubectl create secret generic loggify-projects \
  --from-literal=keys='key:tenant:production'

helm upgrade --install loggify . \
  --set gateway.existingSecret=loggify-projects \
  --set gateway.image.repository=registry.example.com/loggify-gateway \
  --set gateway.image.tag=0.1.0
```

Expose the gateway service through the cloud's TLS ingress or load balancer.
The Collector service is intentionally cluster-internal. Replace the debug
exporter in `templates/collector-config.yaml` for a production backend.

