# Prometheus SLO Recording Rules

Meshlens AI's SLO view queries Prometheus for error rates, request rates, and other service-level indicators. For richer SLO data and better performance at scale, you can add **recording rules** to pre-compute SLO metrics.

## Why Recording Rules?

- **Performance**: Recording rules compute metrics at a fixed interval instead of on-demand
- **Consistency**: SLO burn rates and error budgets are calculated consistently
- **Flexibility**: You can define custom SLO targets per service

## Example Recording Rules

Add this to your Prometheus configuration (e.g. `prometheus-rules.yml` or `alertmanager-rules.yml`):

```yaml
groups:
  - name: meshlens-slo
    interval: 1m
    rules:
      # Error rate (5xx) per service pair - Istio/Envoy
      - record: slo:istio_error_rate:5m
        expr: |
          sum(rate(istio_requests_total{reporter="destination",response_code=~"5.."}[5m]))
          / sum(rate(istio_requests_total{reporter="destination"}[5m]))
          * 100
        labels:
          slo: "error_rate"

      # Request rate per service
      - record: slo:istio_request_rate:5m
        expr: sum(rate(istio_requests_total{reporter="destination"}[5m]))
        labels:
          slo: "request_rate"

      # Availability (1 - error rate) for SLO targets
      - record: slo:availability:5m
        expr: |
          1 - (
            sum(rate(istio_requests_total{reporter="destination",response_code=~"5.."}[5m]))
            / sum(rate(istio_requests_total{reporter="destination"}[5m]))
          )
        labels:
          slo: "availability"
```

## Using in Meshlens AI

When configuring the SLO view in Settings, you can either:

1. **Use ad-hoc queries** (default): Meshlens sends PromQL directly. Works out of the box.
2. **Use recording rules**: In the SLO queries, reference the pre-computed metrics:
   - Error rate: `slo:istio_error_rate:5m`
   - Request rate: `slo:istio_request_rate:5m`
   - Availability: `slo:availability:5m`

## Reload Prometheus

After adding rules:

```bash
# If using Prometheus Operator
kubectl apply -f prometheus-rules.yml

# Or send SIGHUP to Prometheus
kill -HUP $(pgrep prometheus)
```

## Further Reading

- [Prometheus Recording Rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)
- [The Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/)
