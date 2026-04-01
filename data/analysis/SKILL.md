---
name: Data Analysis
description: >
  SQL analytics, exploratory data analysis (EDA), statistical reasoning,
  A/B testing, and translating data findings into business decisions.
requires:
  - data/engineering
improves: []
metadata:
  domain: data
  subdomain: analysis
  maturity: stable
---

# Data Analysis

Data analysis is the discipline of extracting meaning from data. It sits between raw data engineering and the business decision — turning tables into insight.

## SQL for Analysis

SQL is the universal language of data analysis. Master these patterns:

### Window Functions (the most powerful SQL tool)

```sql
-- Running total
SUM(revenue) OVER (PARTITION BY customer_id ORDER BY order_date) AS cumulative_revenue,

-- Rank within group
RANK() OVER (PARTITION BY region ORDER BY revenue DESC) AS revenue_rank,

-- Compare to prior period
revenue - LAG(revenue, 1) OVER (PARTITION BY customer_id ORDER BY month) AS mom_change,

-- Moving average (3-month)
AVG(revenue) OVER (
  PARTITION BY customer_id
  ORDER BY month
  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
) AS ma3_revenue
```

### Cohort Analysis

```sql
-- Customer cohorts: group customers by acquisition month, track retention
SELECT
    DATE_TRUNC('month', first_order_date) AS cohort_month,
    DATE_DIFF('month', first_order_date, order_date) AS months_since_first,
    COUNT(DISTINCT customer_id) AS active_customers
FROM (
    SELECT
        customer_id,
        order_date,
        MIN(order_date) OVER (PARTITION BY customer_id) AS first_order_date
    FROM orders
)
GROUP BY 1, 2
ORDER BY 1, 2
```

### Funnel Analysis

```sql
SELECT
    COUNT(DISTINCT CASE WHEN step >= 1 THEN user_id END) AS visited_page,
    COUNT(DISTINCT CASE WHEN step >= 2 THEN user_id END) AS started_signup,
    COUNT(DISTINCT CASE WHEN step >= 3 THEN user_id END) AS completed_signup,
    COUNT(DISTINCT CASE WHEN step >= 4 THEN user_id END) AS first_purchase
FROM funnel_events
```

---

## Exploratory Data Analysis (EDA)

Before building models or writing reports, understand your data:

### EDA Checklist

1. **Shape**: How many rows and columns? What is the unit of analysis (one row = one what)?
2. **Types**: What is the data type of each column? Are dates stored as strings? Are IDs stored as floats?
3. **Missing values**: Which columns have nulls? Is the null systematic (always null for a certain customer type) or random?
4. **Distributions**: For numerical columns — what is the min, max, mean, median, std? Any extreme outliers?
5. **Cardinality**: For categorical columns — how many unique values? Any unexpected values?
6. **Temporal patterns**: Does volume vary by day of week, hour, month? Are there anomalous spikes?
7. **Relationships**: Do key joins produce the expected row counts? Are there many-to-many joins masquerading as one-to-many?

### Red Flags in Data

| Signal | Likely Cause |
|--------|-------------|
| Primary key has duplicates | Pipeline bug; upstream data issue |
| Volume drops to zero for a period | Pipeline failure; source system outage |
| Metric jumps suddenly | Tracking code change; product change; data model bug |
| 99th percentile is 1,000× the median | Outliers; bad data; test accounts not filtered |
| Joins produce more rows than expected | Many-to-many relationship; missing deduplication |

---

## Statistical Reasoning for Analysts

You do not need a statistics degree to reason correctly about data. You need to avoid the most common errors:

### Survivorship Bias
You can only analyse data for entities that made it into your dataset. Customers who churned before signing up for your loyalty programme are invisible. Design around this — ask "what data am I missing?"

### Simpson's Paradox
A trend that appears in aggregated data can reverse when the data is disaggregated. Always segment your data before drawing conclusions from aggregates.

### Correlation vs Causation
Two metrics moving together does not mean one causes the other. Before asserting causality, you need either a randomised experiment or a credible causal mechanism.

### Sample Size Intuition
| Effect Size | N needed (per group, 80% power, α=0.05) |
|-------------|----------------------------------------|
| Large (d=0.8) | ~26 |
| Medium (d=0.5) | ~64 |
| Small (d=0.2) | ~394 |

Small effects require large samples. If you are detecting a 2% conversion rate improvement, you need thousands of users per variant.

---

## A/B Testing

### Minimum Viable Experiment Design

1. **Hypothesis**: Changing X will increase Y by Z% because [mechanism].
2. **Primary metric**: One metric. The experiment succeeds or fails on this metric.
3. **Guardrail metrics**: Metrics that must not move negatively (revenue, NPS, latency).
4. **Sample size calculation**: Use a power calculator. Never stop early because it looks good.
5. **Randomisation unit**: User, session, or device? Must match the analysis unit.
6. **Duration**: Run for at least one full business cycle (minimum 1 week, ideally 2).

### Common A/B Testing Mistakes

- **Peeking**: Stopping the test early when results look significant. Use sequential testing or pre-commit to a duration.
- **Multiple comparisons**: Testing 10 variants against control inflates false-positive rate. Apply Bonferroni correction or use Bayesian methods.
- **Novelty effect**: Users behave differently with new features purely because they are new. Allow time for novelty to wear off.
- **Network effects**: If user behaviour affects other users (social features, marketplaces), standard A/B randomisation is invalid. Use cluster randomisation.

---

## Communicating Findings

### The Pyramid Principle

Lead with the conclusion, not the analysis. Structure: Answer → Arguments → Evidence.

Bad: "We looked at customer data from January to March. We ran a cohort analysis. We then segmented by region. We found..."

Good: "Churn is concentrated in the first 30 days among customers acquired through paid social — here is the evidence."

### Chart Selection

| Question Type | Best Chart |
|--------------|-----------|
| How does X change over time? | Line chart |
| How do parts compare to a whole? | Bar chart (not pie) |
| How are two variables related? | Scatter plot |
| How is a value distributed? | Histogram or box plot |
| How does a metric vary across two dimensions? | Heatmap |

**Rule**: If you cannot explain what a chart shows in one sentence, the chart is too complex.

### Numbers That Matter

Always pair a number with context:
- Raw number: "We have 1,200 active users"
- With context: "We have 1,200 active users — up 18% MoM, but still 40% below our Q3 target of 2,000"
