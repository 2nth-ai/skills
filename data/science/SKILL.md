---
name: Data Science
description: >
  Machine learning model development — problem framing, feature engineering,
  model selection, evaluation, and communicating results to non-technical stakeholders.
requires:
  - data/analysis
  - data/engineering
improves: []
metadata:
  domain: data
  subdomain: science
  maturity: stable
---

# Data Science

Data science is the discipline of building predictive and explanatory models from data. The goal is not to build impressive models — it is to improve decisions.

## Problem Framing First

Before touching data or code, frame the problem correctly:

1. **What decision does this model support?** If the model is 90% accurate, who acts on it and how?
2. **What is the cost of a false positive vs false negative?** A fraud model that misses fraud (false negative) costs money. One that flags legitimate transactions (false positive) destroys customer trust. Which is worse for your business?
3. **What is the baseline?** How good is the current decision-making without a model? A model that beats a simple rule is not automatically worth deploying.
4. **What data exists at prediction time?** You can only use features available when the model runs. Future data is not available at prediction time.

---

## The ML Development Process

```
Problem framing
    ↓
Data collection + EDA
    ↓
Feature engineering
    ↓
Model selection + training
    ↓
Evaluation (offline)
    ↓
Business validation (does it actually improve the decision?)
    ↓
Production deployment (→ data/ml-ops)
    ↓
Monitoring + iteration
```

---

## Feature Engineering

Features are the inputs to your model. Good features matter more than model choice.

### Feature Types

| Type | Examples | Considerations |
|------|----------|---------------|
| Numerical | Revenue, age, count | Scale for distance-based models (KNN, SVM, neural nets); tree models are scale-invariant |
| Categorical | Country, product category, industry | Encode: one-hot (low cardinality), target encoding (high cardinality) |
| Temporal | Day of week, days since event, rolling averages | Avoid leaking future information |
| Text | Customer notes, support tickets | TF-IDF, embeddings (BERT, Sentence Transformers) |
| Entity embeddings | Customer ID, product ID | Learn representations via embedding layers |

### Feature Engineering Patterns

**Ratio features**: Often more predictive than raw numbers.
```python
df['revenue_per_user'] = df['total_revenue'] / df['user_count']
df['churn_rate'] = df['churned_last_30d'] / df['active_30d_ago']
```

**Lag features**: The value of X at time t-N.
```python
df['revenue_lag_1m'] = df.groupby('customer_id')['revenue'].shift(1)
df['revenue_lag_3m'] = df.groupby('customer_id')['revenue'].shift(3)
```

**Rolling aggregates**:
```python
df['revenue_ma3'] = df.groupby('customer_id')['revenue'].transform(
    lambda x: x.rolling(3, min_periods=1).mean()
)
```

**Data leakage warning**: Never include features that contain information about the target variable or that would not be available at prediction time. This is the most common cause of models that look excellent in development and fail in production.

---

## Model Selection

Start simple. Add complexity only when simpler models are insufficient.

### Hierarchy of complexity

1. **Logistic regression / Linear regression** — Interpretable; fast; strong baseline; works well with small data.
2. **Decision tree** — Interpretable; handles non-linearity; prone to overfitting alone.
3. **Random forest** — Robust; good default for structured data; handles missing values.
4. **Gradient boosting (XGBoost, LightGBM, CatBoost)** — State-of-the-art for tabular data; requires hyperparameter tuning.
5. **Neural networks** — Required for unstructured data (images, text, audio); overkill for most tabular problems.

**Default choice for structured/tabular data**: Start with gradient boosting (LightGBM or XGBoost). Beat it with a simpler model before accepting the complexity.

### Problem Type → Algorithm

| Problem | Algorithm Family |
|---------|----------------|
| Binary classification | Logistic regression, gradient boosting, neural net |
| Multi-class | Softmax regression, gradient boosting |
| Regression | Linear regression, gradient boosting, neural net |
| Ranking | LambdaMART, pairwise learning-to-rank |
| Clustering | K-means, DBSCAN, hierarchical |
| Anomaly detection | Isolation Forest, Autoencoder, statistical thresholds |
| Time series forecasting | Prophet, ARIMA, LightGBM with lag features |
| NLP classification | Fine-tuned BERT / Sentence Transformers + classifier head |

---

## Model Evaluation

### Classification Metrics

| Metric | Formula | When to Use |
|--------|---------|------------|
| Accuracy | TP+TN / Total | Only when classes are balanced |
| Precision | TP / (TP+FP) | When false positives are costly |
| Recall | TP / (TP+FN) | When false negatives are costly |
| F1 | 2×(P×R)/(P+R) | When you need a single score balancing both |
| AUC-ROC | Area under ROC curve | Ranking quality; class imbalance robust |
| AUC-PR | Area under Precision-Recall curve | Best for highly imbalanced datasets |

**For churn prediction**: Recall matters more (you want to catch churners). For fraud: Precision matters more (you cannot flag every transaction as fraud).

### Regression Metrics

| Metric | Formula | Interpretation |
|--------|---------|---------------|
| MAE | Mean(|y - ŷ|) | Average error in same units as target |
| RMSE | √Mean((y-ŷ)²) | Penalises large errors more; sensitive to outliers |
| MAPE | Mean(|y-ŷ|/y) × 100 | % error; meaningless if y can be zero |

### Validation Strategy

- **Hold-out split**: 70/15/15 (train/validation/test). Use validation for tuning, test for final evaluation.
- **Cross-validation (k-fold)**: More reliable estimate on small datasets. 5-fold is standard.
- **Time-series split**: Never shuffle time-series data. Train on past, validate on future. Use `TimeSeriesSplit`.

---

## Communicating Models to Non-Technical Stakeholders

Executives do not care about AUC. They care about business outcomes.

### Translate Model Performance into Business Impact

Instead of: "Our churn model has AUC 0.84."

Say: "If we act on the model's top-200 churn predictions each month, we expect to retain 60–70 customers who would otherwise have left. At an average LTV of R45,000, that is R2.7–3.1M in retained revenue per month."

### Explainability

For regulated industries or high-stakes decisions (credit, employment, healthcare), black-box models create legal and ethical risk. Use:
- **SHAP values**: Show each feature's contribution to a specific prediction.
- **LIME**: Local approximation of model behaviour around a single prediction.
- **Inherently interpretable models**: Logistic regression, decision trees — the model itself is the explanation.

**South African context**: Under POPIA, automated decisions that affect individuals must be explainable. Sections 71 of POPIA grants a right to human review of automated decisions. Ensure ML-driven decisions in credit, HR, or customer service have documented explainability.
