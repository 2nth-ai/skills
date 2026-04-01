---
name: MLOps
description: >
  Taking ML models from notebook to production — model serving, CI/CD for ML,
  feature stores, monitoring, drift detection, and retraining pipelines.
requires:
  - data/science
  - data/engineering
improves: []
metadata:
  domain: data
  subdomain: ml-ops
  maturity: stable
---

# MLOps

MLOps is the discipline of operating machine learning models in production reliably. A model that is not deployed creates no value. A model that is deployed but not monitored creates risk.

## The MLOps Gap

Most data science teams can train a model. Fewer can keep it working. The gap between "model trained" and "model trusted in production" is MLOps.

### The Production Checklist

Before a model goes live:
- [ ] Reproducible training pipeline (not a notebook)
- [ ] Model versioned and registered
- [ ] Serving infrastructure tested at production load
- [ ] Input validation (reject or flag unexpected inputs)
- [ ] Prediction logging enabled
- [ ] Drift monitoring configured with alerting thresholds
- [ ] Rollback procedure documented and tested
- [ ] Baseline performance documented (for regression detection)

---

## Model Serving Patterns

### Batch Scoring
Run predictions on a schedule, store results in a table for downstream use.

```
Trigger (daily/hourly)
    → Load model from registry
    → Score all entities requiring prediction
    → Write predictions to output table
    → Downstream systems read from table
```

**Use when**: Predictions are needed ahead of time (next-day recommendations, weekly churn scores). Latency requirements are > minutes.

### Real-time API Serving

Model is deployed as an HTTP endpoint. Predictions are returned synchronously.

```
Request → Load Balancer → Prediction Service → Model → Response
                              ↓ async
                         Prediction Log
```

**Use when**: Predictions must be returned in < 500ms. Fraud scoring, real-time personalisation, search ranking.

**Options**:
| Platform | Best For |
|----------|---------|
| **FastAPI + Docker + Cloud Run** | Simple models; cost-effective; auto-scaling to zero |
| **BentoML** | Model packaging + serving; multi-framework |
| **Seldon Core / KServe** | Kubernetes-native; large scale; canary deployments |
| **Vertex AI Endpoints** | GCP-native; managed infrastructure; built-in monitoring |
| **SageMaker Endpoints** | AWS-native; managed; A/B testing support |

### Async / Event-Driven Scoring

Model consumes from a message queue, publishes predictions to another.

```
Kafka topic (events) → Consumer → Model → Kafka topic (predictions)
```

**Use when**: High throughput without synchronous latency requirements. IoT sensor processing, clickstream scoring.

---

## Feature Stores

A feature store solves the feature consistency problem: the same feature computed differently in training and serving.

**Without a feature store**: Training uses a SQL query; serving computes the same feature in Python. Logic drifts. Model performance degrades silently.

**With a feature store**:
- Features are defined once, computed once
- Offline store (data warehouse) serves training
- Online store (Redis, DynamoDB) serves production at low latency
- Both stores use the same feature definitions

**Popular feature stores**: Feast (open-source), Tecton, Vertex AI Feature Store, SageMaker Feature Store.

**When you need one**: When the same features are used in multiple models, or when training-serving skew is causing production performance issues.

---

## Model Registry and Versioning

Every model artefact must be versioned and tracked.

Minimum metadata per model version:
- Training data snapshot / date range
- Feature list + feature schema
- Hyperparameters
- Evaluation metrics (offline)
- Git commit of training code
- Who trained it and when
- Deployment status (staging / production / retired)

**Tools**: MLflow Model Registry, Weights & Biases, Vertex AI Model Registry, SageMaker Model Registry.

```python
import mlflow

with mlflow.start_run():
    mlflow.log_params({"n_estimators": 300, "max_depth": 6})
    mlflow.log_metrics({"auc": 0.847, "f1": 0.731})
    mlflow.sklearn.log_model(model, "churn_model")
    mlflow.set_tag("model_type", "churn_prediction")
```

---

## Monitoring and Drift Detection

Models degrade silently. The world changes; the model does not. Monitoring catches this.

### Types of Drift

| Type | What Changes | Detection Method |
|------|-------------|-----------------|
| **Data drift** | Input feature distribution shifts | PSI, KS test, chi-squared on feature distributions |
| **Concept drift** | Relationship between features and target changes | Monitor model accuracy over time (requires ground truth labels) |
| **Prediction drift** | Model output distribution shifts | Monitor prediction score distributions |
| **Label drift** | Target variable distribution changes | Monitor outcome rates with a delay |

### Population Stability Index (PSI)

```
PSI = Σ (Actual% - Expected%) × ln(Actual% / Expected%)
```

| PSI | Interpretation |
|-----|---------------|
| < 0.10 | No significant change |
| 0.10 – 0.25 | Moderate change — investigate |
| > 0.25 | Major shift — retrain required |

### Monitoring Stack

```
Prediction Service
    → Log predictions + input features + metadata
    → Stream to monitoring database
    → Dashboards (Grafana / Looker)
    → Alerting on PSI thresholds, accuracy drops
    → Trigger retraining pipeline when thresholds breached
```

---

## Retraining Pipelines

### Retraining Triggers

1. **Scheduled**: Retrain on a fixed schedule (weekly, monthly). Simple; may retrain unnecessarily.
2. **Performance-based**: Retrain when monitored accuracy drops below threshold. Requires ground truth feedback loop.
3. **Drift-based**: Retrain when data drift exceeds PSI threshold. Faster feedback than waiting for accuracy data.

### Continuous Training Pipeline

```
Monitor drift/performance
    → Trigger condition met
    → Pull fresh training data
    → Run feature engineering
    → Train candidate model
    → Evaluate against champion model
    → If challenger wins: promote to production (canary → full rollout)
    → If challenger loses: alert + investigate
    → Log all artefacts to model registry
```

### Shadow Mode Deployment

Run new model in parallel with current model. Log predictions from both. Evaluate before switching traffic. Zero risk A/B testing for models.

---

## CI/CD for ML

Apply software engineering discipline to ML pipelines:

```yaml
# .github/workflows/model-ci.yml
on: [push]
jobs:
  test:
    steps:
      - name: Run unit tests on feature engineering
        run: pytest tests/features/
      - name: Validate training data schema
        run: python scripts/validate_schema.py
      - name: Train and evaluate model
        run: python train.py --config config/ci.yaml
      - name: Compare against baseline
        run: python evaluate.py --min-auc 0.80
      - name: Register model if evaluation passes
        run: python register_model.py
```

Tests to write for ML systems:
- Feature engineering functions (unit tests)
- Data schema validation (input contracts)
- Model inference endpoint (integration tests — test with sample inputs)
- Prediction distribution sanity checks (does the model ever output NaN? Out-of-range scores?)
