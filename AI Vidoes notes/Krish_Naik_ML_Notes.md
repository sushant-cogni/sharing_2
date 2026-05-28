# 📚 Krish Naik — Complete Machine Learning Notes
> Easy-to-read notes from the full ML course. Read these and you'll remember every video!

---

## 📌 Table of Contents
1. [AI vs ML vs DL vs Data Science](#1-ai-vs-ml-vs-dl-vs-data-science)
2. [Supervised vs Unsupervised ML](#2-supervised-vs-unsupervised-ml)
3. [Linear Regression](#3-linear-regression)
4. [Cost Function & Gradient Descent](#4-cost-function--gradient-descent)
5. [R² and Adjusted R²](#5-r-and-adjusted-r)
6. [Ridge & Lasso Regression](#6-ridge--lasso-regression)
7. [Assumptions of Linear Regression](#7-assumptions-of-linear-regression)
8. [Logistic Regression](#8-logistic-regression)
9. [Confusion Matrix, Precision, Recall, F-Score](#9-confusion-matrix-precision-recall-f-score)
10. [Naive Bayes](#10-naive-bayes)
11. [KNN Algorithm](#11-knn-algorithm)
12. [Decision Tree](#12-decision-tree)
13. [Ensemble Techniques — Bagging & Boosting](#13-ensemble-techniques--bagging--boosting)
14. [Random Forest](#14-random-forest)
15. [AdaBoost](#15-adaboost)
16. [XGBoost](#16-xgboost)
17. [K-Means Clustering](#17-k-means-clustering)
18. [Hierarchical Clustering](#18-hierarchical-clustering)
19. [Silhouette Score](#19-silhouette-score)
20. [DBSCAN Clustering](#20-dbscan-clustering)
21. [SVM (Support Vector Machine)](#21-svm-support-vector-machine)
22. [Bias and Variance — Clear Definitions](#22-bias-and-variance--clear-definitions)

---

## 1. AI vs ML vs DL vs Data Science

> 🎯 **Purpose of session** — to help you clear Data Science interviews by explaining algorithms clearly.

### 🌐 The Big Picture (Think of it as circles inside circles)

```
AI (outermost)
  └── ML (subset of AI)
       └── DL (subset of ML)
```

**AI (Artificial Intelligence)**
- Any application that performs tasks **without human intervention**.
- It makes decisions on its own.
- Examples:
  - **Netflix** → recommends action movies if you watch action movies (recommendation engine)
  - **Amazon** → recommends headphones when you buy an iPhone
  - **YouTube Ads** → shows you relevant ads (business-driven AI)
  - **Tesla Self-Driving Cars** → drives based on roads automatically

**ML (Machine Learning)**
- ML is a **subset of AI**.
- It provides **statistical tools** to:
  - Analyze data
  - Visualize data
  - Do **predictions and forecasting**
- Internally, ML algorithms use **statistics**.

**DL (Deep Learning)**
- DL is a **subset of ML**.
- Came into existence because scientists (1950s-60s) wanted machines to learn like humans.
- **Goal:** Mimic the human brain using **multi-layered neural networks**.
- Solves very complex problems (images, speech, etc.)

**Data Scientist**
- A Data Scientist works with **everything** — ML, DL, data analysis, visualization.
- Example: At Panasonic, Krish used Power BI for analysis, ML projects, and DL projects — all as a Data Scientist.

---

## 2. Supervised vs Unsupervised ML

### ✅ Supervised Machine Learning

- You have **input features (independent)** AND **output label (dependent)**.
- Two types of problems:

#### 🔵 Regression Problem
- Output is a **continuous variable** (any number like weight, price, salary).
- Example: Predicting weight from age → output can be 62.5 kg, 71 kg, etc.
- Solved by drawing a **best fit line** using equation: `y = mx + C`

#### 🟡 Classification Problem
- Output has **fixed categories**.
- Example: Pass or Fail based on study hours, play hours, sleep hours.
- **Binary Classification** → only 2 categories (pass/fail, yes/no)
- **Multiclass Classification** → more than 2 categories

> 💡 In supervised ML, there is always **1 dependent feature** and can be any number of **independent features**.

---

### ✅ Unsupervised Machine Learning

- **No output variable** / no dependent feature.
- Two types of problems:

#### 🟢 Clustering
- Group similar data points together.
- Example: Customer segmentation using salary and age.
  - Cluster 1 → Young, high salary
  - Cluster 2 → Middle-aged, average salary
  - Cluster 3 → Older, high salary
- **Use case:** Target ads to specific groups (rich people get luxury ads, middle class get budget ads).
- ⚠️ Clustering is NOT classification — there is NO output label.

#### 🟣 Dimensionality Reduction
- Reduce 1000 features → 100 features (lower dimensions).
- Algorithms: **PCA**, **LDA**

---

### Algorithms We Will Cover

| Supervised | Unsupervised |
|---|---|
| Linear Regression | K-Means |
| Ridge & Lasso | DBSCAN |
| Logistic Regression | Hierarchical Clustering |
| Decision Tree | KNN (Clustering) |
| AdaBoost | PCA |
| Random Forest | LDA |
| Gradient Boosting | |
| XGBoost | |
| Naive Bayes | |
| SVM | |

---

## 3. Linear Regression

### 🎯 What is Linear Regression?

- Used to solve **regression problems** (continuous output).
- Goal: Find the **best fit line** through the data points.
- Example: Predict **weight (Y)** from **age (X)**.

### 📐 The Equation

The line equation is written in many ways — Krish follows **Andrew Ng's notation**:

```
H(θ)(x) = θ₀ + θ₁ * x
```

Also written as:
- `y = mx + C`
- `y = β₀ + β₁x`
- `H(θ)(x) = θ₀ + θ₁x`  ← this is what we use

**θ₀ (Theta 0) = Intercept**
- The point where the line meets the **Y-axis** when X = 0.

**θ₁ (Theta 1) = Slope / Coefficient**
- For every 1 unit increase in X, how much does Y change?
- A steep line = high slope.

### 🎯 Goal of Linear Regression

Find the best fit line such that the **distance between real points and predicted points is minimum**.

- Real point = actual Y value from dataset
- Predicted point = Y value from the line (H(θ)(x))
- We need to **minimize the sum of all these distances**.

---

## 4. Cost Function & Gradient Descent

### 📉 Cost Function

The cost function measures how wrong our model is:

```
J(θ₀, θ₁) = (1/2m) * Σ(H(θ)(xᵢ) - yᵢ)²
```

- **H(θ)(xᵢ)** = predicted value
- **yᵢ** = real value
- **(1/m)** → gives average
- **(1/2)** → just to simplify derivative calculation (the 2 cancels when we differentiate)
- This entire equation is called **Squared Error Function**.

### 🎯 Our Goal

**Minimize** J(θ₀, θ₁) by adjusting θ₀ and θ₁.

### 📊 Understanding with Example

> Say we have 3 data points: (1,1), (2,2), (3,3) and θ₀ = 0

| θ₁ value | What happens | J(θ₁) value |
|---|---|---|
| θ₁ = 1 | Line passes through all points | 0 |
| θ₁ = 0.5 | Line is less steep, misses points | ≈ 0.58 |
| θ₁ = 0 | Line is flat on X-axis | ≈ 2.3 |

When you plot θ₁ vs J(θ₁), you get a **U-shaped parabola curve** → this is the **Gradient Descent curve**.

### 🏔️ Gradient Descent

The bottom of the U-curve = **Global Minima** = the best θ₁ value.

**How to reach Global Minima? → Convergence Algorithm:**

```
Repeat until convergence:
    θ₀ = θ₀ - α * (∂/∂θ₀) J(θ₀, θ₁)
    θ₁ = θ₁ - α * (∂/∂θ₁) J(θ₀, θ₁) * xᵢ
```

After solving derivatives:
```
θ₀ = θ₀ - α * (1/m) * Σ(H(θ)(xᵢ) - yᵢ)
θ₁ = θ₁ - α * (1/m) * Σ(H(θ)(xᵢ) - yᵢ) * xᵢ
```

### ⚡ Learning Rate (α)

- Controls **how fast** we move towards Global Minima.
- **Too small α** → Takes very long to converge (tiny steps).
- **Too large α** → Keeps jumping around, never converges.
- Usually start with **α = 0.01**.

### 🔵 Positive Slope vs Negative Slope

- If you're on the **right side** of the curve → positive slope → θ₁ decreases (moving left = towards minima ✅)
- If you're on the **left side** → negative slope → minus × minus = positive → θ₁ increases (moving right = towards minima ✅)

### 🔴 Local Minima — Does Linear Regression Have It?

**No!** The cost function (squared error) in linear regression always forms a **convex parabola** — so there is only a **Global Minima**, never a Local Minima.

> 💡 **Interview Answer:** Linear regression does NOT have a local minima issue. But in Deep Learning (ANN), we have local minima, which is solved using optimizers like **RMSProp** and **Adam**.

---

## 5. R² and Adjusted R²

### 📊 R² (R-Squared)

Used to check **how good your linear regression model is**.

```
R² = 1 - (Sum of Residuals / Sum of Total)

= 1 - [ Σ(yᵢ - ŷᵢ)² / Σ(yᵢ - ȳ)² ]
```

- **ŷᵢ** = predicted values (from best fit line)
- **ȳ** = mean of Y

**How to interpret:**
- Numerator = distance between real and predicted points (our model's line)
- Denominator = distance between real and mean line (a flat horizontal line)
- Denominator is always **bigger** than numerator (ideally)
- So R² is a **number close to 1 (or 100%)** when model is good.

**Can R² be negative?** Yes, if the best fit line is worse than the mean line — but this rarely happens in practice.

### ⚠️ Problem with R²

**Even if you add a useless feature (like gender for house price), R² still increases!**

Example:
- Features: Bedrooms + Location → R² = 90%
- Add Gender → R² = 91% ← gender has nothing to do with price!

This is the **flaw of R²** — it just keeps increasing as you add more features.

### ✅ Adjusted R² — The Fix

```
Adjusted R² = 1 - [(1 - R²)(N - 1) / (N - P - 1)]
```

- **N** = total number of data points (samples)
- **P** = number of features (predictors)

**How Adjusted R² fixes the problem:**
- When P (features) increases with irrelevant features → the denominator (N - P - 1) gets smaller
- Smaller denominator → bigger division result → 1 minus big number = smaller Adjusted R²
- So **Adjusted R² decreases when useless features are added** ✅

> 💡 **Interview Question:** "Which is always bigger — R² or Adjusted R²?"
> **Answer: R²** is always bigger. Adjusted R² is always slightly less than R².

---

## 6. Ridge & Lasso Regression

### ❓ Why Do We Need Them?

**Problem: Overfitting**

When a model fits training data too perfectly (cost function = 0), it fails on new test data.

**Overfitting:** Model performs great on training data, but bad on test data.
→ Low Bias, High Variance

**Solution:** Add a penalty term to the cost function → **Regularization**

---

### 🔵 Ridge Regression (L2 Regularization)

```
Cost Function = Σ(ŷᵢ - yᵢ)² + λ * (slope)²
```

- **λ (Lambda)** = hyperparameter (controls penalty strength)
- **slope²** = squared value of all coefficients (θ₁, θ₂, ...)

**What it does:**
- Adds a squared penalty for steep slopes
- Cost function never reaches zero → prevents overfitting
- Forces the model to find a **less steep, more generalized line**
- **Purpose:** Prevent overfitting only

**Lambda (λ) — what it controls:**
- High λ → stronger penalty on slopes → flatter line (may underfit)
- Low λ → weaker penalty → model may still overfit
- Best λ found using **Cross-Validation**

---

### 🟡 Lasso Regression (L1 Regularization)

```
Cost Function = Σ(ŷᵢ - yᵢ)² + λ * |slope|
```

- Uses **absolute value (modulus)** instead of square.

**What it does:**
- Prevents overfitting ✅ (same as Ridge)
- Also does **Feature Selection** ✅ ← this is extra!

**Why Feature Selection?**
- With many features, some may have very small coefficients (θ values near zero)
- With `|slope|` (modulus), those small coefficients get pushed to **exactly zero**
- A coefficient = 0 means **that feature is completely ignored**
- With `slope²` (Ridge), small values get squared (made smaller) but **never exactly zero**

> 💡 **Lasso = Prevent Overfitting + Feature Selection**
> **Ridge = Prevent Overfitting only**

**In practice:** Try both — use the one with better performance metrics.

---

## 7. Assumptions of Linear Regression

1. **Normal Distribution** — Features should follow Gaussian/normal distribution. If not, apply feature transformation.

2. **Standardization** — Apply standard scaler (Z-score: mean=0, std=1). Especially important when gradient descent is involved — helps the model converge faster.

3. **Linearity** — Works best when data has a linear relationship.

4. **No Multicollinearity** — If two features are 95% correlated with each other, drop one of them. Check using **VIF (Variance Inflation Factor)**.

5. **Homoscedasticity** — Residuals should have constant variance.

---

## 8. Logistic Regression

### ❓ Why Not Use Linear Regression for Classification?

Two problems with using linear regression for classification:

1. **Outlier problem** — One outlier shifts the entire line, causing wrong predictions.
2. **Values go beyond 0 and 1** — In classification, output should only be 0 or 1, but linear regression can give negative values or values > 1.

### 🔵 Sigmoid / Logistic Function — The Fix

We apply this function on top of the linear equation to **squash the output between 0 and 1**:

```
H(θ)(x) = G(θ₀ + θ₁x)

where G(z) = 1 / (1 + e^(-z))
```

- If z is large positive → G(z) approaches 1
- If z is large negative → G(z) approaches 0
- At z = 0 → G(z) = 0.5

This is called the **Sigmoid function** (also called Logistic function — that's why the algorithm is called Logistic Regression!).

### 📊 Decision Boundary

```
If G(z) ≥ 0.5 → predict class 1 (whenever z ≥ 0)
If G(z) < 0.5 → predict class 0 (whenever z < 0)
```

### ⚠️ Why Not Use the Same Cost Function as Linear Regression?

If we plug the sigmoid into the linear regression cost function, the result is a **non-convex function** (wavy curve with many local minima).

**With local minima** → gradient descent gets stuck → never finds global minima ❌

### ✅ Logistic Regression Cost Function

```
Cost = -y * log(H(θ)(xᵢ)) - (1-y) * log(1 - H(θ)(xᵢ))
```

In one formula:
```
J(θ) = -(1/m) * Σ [ y*log(H(θ)(x)) + (1-y)*log(1 - H(θ)(x)) ]
```

**Why this works:**
- When y=1 and prediction=1 → cost = 0 ✅
- When y=1 and prediction=0 → cost = very high ❌
- When y=0 and prediction=0 → cost = 0 ✅
- When y=0 and prediction=1 → cost = very high ❌

Using **log** makes this a **convex function** → always has a Global Minima → gradient descent works perfectly ✅

---

## 9. Confusion Matrix, Precision, Recall, F-Score

### 📊 Confusion Matrix

For binary classification (0 or 1):

|  | Predicted 0 | Predicted 1 |
|---|---|---|
| **Actual 0** | True Negative (TN) | False Positive (FP) |
| **Actual 1** | False Negative (FN) | True Positive (TP) |

- **TP** — Actual 1, Predicted 1 → Correct ✅
- **TN** — Actual 0, Predicted 0 → Correct ✅
- **FP** — Actual 0, Predicted 1 → Wrong ❌ (False Alarm)
- **FN** — Actual 1, Predicted 0 → Wrong ❌ (Missed!)

### 📈 Accuracy

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

### ⚠️ Problem with Accuracy on Imbalanced Data

If dataset has 900 zeros and 100 ones → a model that **always predicts 0** gets 90% accuracy! But it's a terrible model.

→ For imbalanced data, use **Precision, Recall, F-Score**.

### 🎯 Precision (focus: False Positives)

```
Precision = TP / (TP + FP)
```
"Out of all predicted positives, how many were actually positive?"

**Use when:** FP is costly → Example: **Spam Email Classification**
- If a real email is marked as spam (FP), that's bad!
- We want to reduce False Positives.

### 🎯 Recall / Sensitivity (focus: False Negatives)

```
Recall = TP / (TP + FN)
```
"Out of all actual positives, how many did we correctly predict?"

Also called **True Positive Rate** or **Sensitivity**.

**Use when:** FN is costly → Example: **Cancer Detection**
- If a person HAS cancer but model says NO cancer (FN) → very dangerous!
- We want to reduce False Negatives.

### ⚖️ F-Score (F-Beta Score)

Used when **both FP and FN matter**:

```
F(β) = (1 + β²) * (Precision * Recall) / (β² * Precision + Recall)
```

| β value | Meaning | Score name |
|---|---|---|
| β = 1 | Both FP and FN equally important | F1 Score |
| β = 0.5 | FP more important than FN | F0.5 Score |
| β = 2 | FN more important than FP | F2 Score |

**F1 Score** (most common):
```
F1 = 2 * (Precision * Recall) / (Precision + Recall)
```
This is the **harmonic mean** of Precision and Recall.

> 💡 **Interview Example:** Stock market crash prediction
> - For **people** (want to sell before crash) → focus on Recall (don't want to miss the crash)
> - For **companies** (don't want wrong predictions) → focus on Precision
> - If **both matter** → use F-Score

---

## 10. Naive Bayes

### 📐 Bayes Theorem (Foundation)

```
P(A|B) = P(B|A) * P(A) / P(B)
```

**Dependent events vs Independent events:**
- Rolling a dice → each roll is independent (getting 3 doesn't affect next roll)
- Drawing marbles from a bag → dependent events (removing one changes probabilities)

### 🎯 Naive Bayes for Classification

Given features X1, X2, X3, ... Xn → predict output Y (Yes/No)

```
P(Y=Yes | X) ∝ P(Yes) * P(X1|Yes) * P(X2|Yes) * ... * P(Xn|Yes)
P(Y=No | X) ∝ P(No) * P(X1|No) * P(X2|No) * ... * P(Xn|No)
```

The denominator P(X) is the same for both → we ignore it (it's a constant).

**Steps to classify:**
1. Calculate P(Yes | X) using the formula
2. Calculate P(No | X) using the formula
3. Normalize: P(Yes) = value / (P(Yes) + P(No))
4. Compare: whichever is higher = predicted class

### 🌤️ Example (Play Tennis Dataset)

Given: Outlook=Sunny, Temperature=Hot → will the person play tennis?

**Step 1 — Build frequency tables from training data:**

| Outlook | Yes | No | P(Yes) | P(No) |
|---|---|---|---|---|
| Sunny | 2 | 3 | 2/9 | 3/5 |
| Overcast | 4 | 0 | 4/9 | 0/5 |
| Rain | 3 | 2 | 3/9 | 2/5 |

P(Yes overall) = 9/14, P(No overall) = 5/14

**Step 2 — For new data (Sunny, Hot):**
```
P(Yes | Sunny, Hot) ∝ (9/14) * (2/9) * (2/9) = 0.031
P(No | Sunny, Hot) ∝ (5/14) * (3/5) * (2/5) = 0.085
```

**Step 3 — Normalize:**
```
P(Yes) = 0.031 / (0.031 + 0.085) = 27%
P(No) = 0.085 / (0.031 + 0.085) = 73%
```
→ **Prediction: No (person will NOT play tennis)**

> 💡 **Why "Naive"?** Because it assumes all features are **independent** of each other — which is a naive assumption but works well in practice.

---

## 11. KNN Algorithm

### 🎯 What is KNN?

**K-Nearest Neighbor** — works for both **classification and regression**.

- K = hyperparameter (how many nearest neighbors to look at)
- Works by calculating **distance** from the new point to all existing points.

### 🔵 KNN for Classification

1. For a new data point, find the K **nearest** existing points.
2. Count which class appears most (majority voting).
3. Assign that class to the new point.

**Example:** K=5 → 3 red points nearby + 2 white points → New point classified as **Red**.

### 🔵 KNN for Regression

1. Find K nearest points.
2. Take the **average** of their Y values.
3. That average = prediction.

### 📏 Distance Formulas

**Euclidean Distance:**
```
d = √((x₂-x₁)² + (y₂-y₁)²)
```
(straight line between two points)

**Manhattan Distance:**
```
d = |x₂-x₁| + |y₂-y₁|
```
(movement along grid lines, like city blocks)

### ⚠️ KNN Weaknesses

1. **Outliers** → One outlier near the decision boundary can misclassify new points.
2. **Imbalanced datasets** → If one class has far more points, most "nearest neighbors" will belong to that class.
3. **Standardization is required** → since KNN uses distance, large-scale features dominate.
4. **Slow at prediction** → must calculate distance to every point every time.

> 💡 **Interview:** Is KNN affected by outliers? **Yes!**
> Is KNN affected by imbalanced data? **Yes!**
> Is standardization required for KNN? **Yes!** (because it uses distance)

---

## 12. Decision Tree

### 🌳 What is a Decision Tree?

A decision tree is like a series of **if-else conditions**:

```python
if age <= 18:
    print("Go to College")
elif age <= 35:
    print("Work")
else:
    print("Retire")
```

This becomes a visual tree where each condition is a **node** and the final answer is a **leaf node**.

### 🎯 Key Terms

- **Root Node** → First split (top of tree)
- **Decision Node** → Internal node where splitting happens
- **Leaf Node** → Final output (no more splitting)
- **Pure Split** → All data in a node belongs to ONE class
- **Impure Split** → Data is mixed between classes

### 📐 How does the tree decide WHICH feature to split on?

Two concepts:

---

#### 🟡 Entropy (Measures Impurity)

```
H(S) = -P(+) * log₂(P(+)) - P(-) * log₂(P(-))
```

- H(S) = 0 → **Pure split** (all YES or all NO) ✅
- H(S) = 1 → **Maximum impurity** (50% YES, 50% NO) ❌

Values range from 0 to 1. Closer to 0 = better (purer).

---

#### 🟢 Gini Impurity (Faster Alternative)

```
Gini = 1 - Σ(pᵢ²)
     = 1 - (P(+)² + P(-)²)
```

- Gini = 0 → Pure
- Gini = 0.5 → Maximum impurity

**Entropy vs Gini:**
- Entropy uses **log** → slower calculation
- Gini uses simple **arithmetic** → faster
- For large datasets with many features → use **Gini** (default in sklearn)
- For small datasets → either is fine

---

#### 🔵 Information Gain (Decides which feature to split on first)

```
Gain(S, Feature) = H(S) - Σ [|S_v|/|S| * H(S_v)]
```

- H(S) = entropy of parent node
- H(S_v) = entropy of each child node after split
- |S_v|/|S| = fraction of data in each child

**Pick the feature with the HIGHEST Information Gain** for splitting.

---

### ⚠️ Continuous Features in Decision Trees

If a feature is numerical (e.g., salary = 40K, 42K, 52K...):
1. Sort the values
2. Try every possible split point (e.g., ≤ 40K, ≤ 42K, ≤ 52K...)
3. Calculate Information Gain for each
4. Pick the split with highest gain

---

### 🔴 Overfitting in Decision Trees

If we keep growing the tree without limit → it memorizes training data → **overfitting**.

**Solutions:**

1. **Pre-Pruning** (stop early) — set hyperparameters:
   - `max_depth` → maximum depth of tree
   - `min_samples_leaf` → minimum samples needed at leaf
   - `max_features` → how many features to consider per split

2. **Post-Pruning** (grow then cut) — grow full tree, then remove branches that don't help.

> 💡 **Decision Tree is a White Box model** — you can visualize exactly how it makes decisions.

> 💡 **Is standardization required for Decision Tree?** **No!** Because splits are based on value comparisons, not distance.

---

## 13. Ensemble Techniques — Bagging & Boosting

> 💡 Ensemble = combine multiple models to get a stronger/better model.

### 🔵 Bagging (Bootstrap Aggregating)

- **Parallel** combination of models.
- Each model is trained on a **random subset of rows** (row sampling with replacement).
- All models are **independent** of each other.
- Final prediction:
  - Classification → **Majority Voting**
  - Regression → **Average of outputs**

```
Data → [Model 1] → Output 1
Data → [Model 2] → Output 2  →  Majority Vote → Final Output
Data → [Model 3] → Output 3
Data → [Model 4] → Output 4
```

**Algorithm using Bagging:** Random Forest

---

### 🔴 Boosting

- **Sequential** combination of models.
- Each model is called a **weak learner**.
- Each new model tries to fix the **mistakes** of the previous one.
- Combined together = **strong learner**.

```
Data → [Weak Learner 1] → [Weak Learner 2] → [Weak Learner 3] → ... → Strong Learner → Output
```

**Analogy:** A physics teacher alone is weak. But physics + chemistry + maths + geography teachers combined = strong!

**Algorithms using Boosting:** AdaBoost, Gradient Boost, XGBoost

---

## 14. Random Forest

### 🎯 Why Random Forest?

**Problem with single decision tree:** It leads to **overfitting** (low bias, high variance).

**Random Forest fixes this:** By combining many decision trees (using bagging), the **high variance reduces** while keeping low bias → **Generalized model** (low bias, low variance).

### ⚙️ How Random Forest Works

1. From the dataset, create **multiple subsets** using:
   - **Row sampling** (random rows with replacement)
   - **Feature sampling** (random subset of features)
2. Train a **separate decision tree** on each subset.
3. For prediction on new data:
   - Classification → **Majority voting** from all trees
   - Regression → **Average** of all tree outputs

### 💡 Important Interview Points

| Question | Answer |
|---|---|
| Is standardization required? | **No** (decision trees don't use distance) |
| Is it affected by outliers? | **No** (trees are robust to outliers) |
| Is it a white box or black box? | **Black box** (too many trees to visualize) |
| Why use it over single decision tree? | Reduces overfitting, converts high variance to low variance |

---

## 15. AdaBoost

### ⚙️ How AdaBoost Works — Step by Step

**Dataset:** Features (F1, F2, F3, F4) + Output (Yes/No)

**Step 1 — Assign equal weights to all records**
```
Initial weight of each record = 1/N  (where N = total records)
```
All weights sum to 1.

**Step 2 — Create a Stump (1-level decision tree)**
- Select the feature with the best Information Gain.
- Build only **1 level deep** decision tree (called a **stump**).
- This is a **weak learner**.

**Step 3 — Calculate Total Error**
```
Total Error = sum of weights of WRONG predictions
```

**Step 4 — Calculate Performance of Stump**
```
Performance = (1/2) * log((1 - Total Error) / Total Error)
```
- Lower error → higher performance score.

**Step 5 — Update Sample Weights**

For **correct** records (reduce weight — less focus next time):
```
New weight = weight * e^(-Performance)
```

For **wrong** records (increase weight — more focus next time):
```
New weight = weight * e^(+Performance)
```

**Normalize** all weights so they sum to 1 again.

**Step 6 — Create Buckets and Pass to Next Stump**
- Create ranges based on normalized weights (like a number line 0 to 1).
- Wrong records get BIGGER buckets → randomly selected more often → go to next stump more.
- Next stump focuses more on previously wrong records.

**Step 7 — Repeat**
- Do this for 100+ stumps.
- Each new stump learns from previous mistakes.

**Final Prediction:**
- Each stump gives one output (0 or 1).
- **Majority voting** → final answer.

---

## 16. XGBoost

### 🎯 What is XGBoost?

**Extreme Gradient Boosting** — boosting technique using binary decision trees.

Works for both **classification** and **regression**.

---

### XGBoost Classifier — Step by Step

**Dataset:** Salary, Credit Score → Loan Approval (0 or 1)

**Step 1 — Create Base Model**
- Initial probability for every record = **0.5** (dummy model).

**Step 2 — Calculate Residuals**
```
Residual = Actual Output - Predicted Probability
```
e.g., Actual=0, Predicted=0.5 → Residual = -0.5

**Step 3 — Build Binary Decision Tree on Residuals**

Feature selection using **Information Gain** with **Similarity Weight**:

```
Similarity Weight = (Σ Residuals)² / (Σ P(1-P) + λ)
```

- P = probability from base model
- λ (Lambda) = regularization hyperparameter (prevent overfitting)

```
Information Gain = Left child SW + Right child SW - Parent SW
```

→ Pick the feature with **highest Information Gain**.

**Step 4 — Inference**
```
Final Output = Base Model + α * Tree1 + α * Tree2 + ... + α * TreeN
```

Then apply **Sigmoid** to get probability between 0 and 1.

---

### XGBoost Regressor — Step by Step

**Step 1 — Base Model** = **average of all output values** (e.g., average salary = 51K)

**Step 2 — Residuals** = Actual - Average

**Step 3 — Similarity Weight formula for regression:**

```
Similarity Weight = (Σ Residuals)² / (Number of Residuals + λ)
```

**Step 4 — Final output:** The leaf node value (average of residuals at that leaf) is added to base model prediction, multiplied by learning rate.

---

## 17. K-Means Clustering

### 🎯 Goal

Group similar data points into **K clusters** where K = number of centroids.

### ⚙️ How K-Means Works — Step by Step

1. **Choose K value** (e.g., K=2 means 2 groups)
2. **Initialize K centroids randomly** in the data space
3. **Calculate distance** from each data point to every centroid (Euclidean distance)
4. **Assign each point** to the nearest centroid
5. **Recompute centroid** = calculate average of all points in the cluster → centroid moves
6. **Repeat steps 3-5** until centroids stop moving (convergence)

### 🤔 How to Choose the Right K?

#### Elbow Method

1. Run K-Means for K = 1, 2, 3, ... 10
2. For each K, compute **WCSS (Within Cluster Sum of Squares)** = sum of distances from each point to its centroid
3. Plot K vs WCSS → curve looks like an **elbow**
4. Pick K at the **elbow point** (where WCSS stops decreasing sharply)

As K increases, WCSS always decreases. The elbow = point of **diminishing returns**.

### ⚠️ Problem: Wrong Centroid Initialization

If centroids start too close to each other → wrong clusters!

**Solution: K-Means++**
- Initializes centroids that are **as far apart as possible** from each other.
- Greatly improves accuracy.
- In sklearn: `KMeans(init='k-means++')`

---

## 18. Hierarchical Clustering

### 🎯 Goal

Build a **hierarchy (tree)** of clusters from bottom to top.

### ⚙️ How It Works

1. Start: Each data point is its own cluster.
2. Find the **2 closest points** → merge them into one cluster.
3. Repeat → keep merging the nearest clusters.
4. Continue until **all points** are in one big cluster.
5. The result is a tree diagram called a **Dendrogram**.

### 📊 Dendrogram

A tree where:
- Bottom = individual points
- Top = one big cluster
- Y-axis = distance at which clusters were merged

### 🔍 How to Find the Right Number of Clusters from Dendrogram?

Find the **longest vertical line that has NO horizontal line crossing it** → draw a horizontal cut there → count how many vertical lines it crosses = **number of clusters**.

### ⏱️ K-Means vs Hierarchical — Which Takes More Time?

**Hierarchical Clustering takes MORE time**, especially for large datasets.

> 💡 **Interview Rule:**
> - Small dataset → Hierarchical Clustering is fine
> - Large dataset → Use K-Means

---

## 19. Silhouette Score

### 🎯 Purpose

Validate how good your clustering model is. Replaces accuracy/F1-score for unsupervised learning.

### 📐 Formula

```
s(i) = (b(i) - a(i)) / max(a(i), b(i))
```

**a(i)** = average distance from point i to ALL other points in the **same cluster**

**b(i)** = average distance from point i to ALL points in the **nearest other cluster**

### 📊 Interpretation

| Score | Meaning |
|---|---|
| Close to **+1** | Point is well-matched to its own cluster, far from others ✅ |
| Around **0** | Point is on the boundary between clusters |
| Close to **-1** | Point is in the wrong cluster ❌ |

**Good model:** b(i) > a(i) → score is positive and close to 1.

### 🔬 Usage in Practice

Try K = 2, 3, 4, 5, 6... For each:
1. Check **average silhouette score** (higher = better)
2. Check if any cluster has **negative scores** (if yes → bad clustering for that K)
3. Select the K with highest score AND no negative values

---

## 20. DBSCAN Clustering

**Density-Based Spatial Clustering of Applications with Noise**

### 🎯 Why DBSCAN?

**K-Means and Hierarchical treat outliers as part of a cluster.**
DBSCAN can **identify and ignore outliers** (noise points) ✅

### 📐 Key Parameters

| Parameter | Meaning |
|---|---|
| **ε (Epsilon)** | Radius of the circle around each point |
| **MinPoints** | Minimum points needed inside ε to be a "core point" |

### 🎯 Point Types

1. **Core Point** — Has at least MinPoints within its ε radius.
2. **Border Point** — Has at least 1 core point within ε, but fewer than MinPoints itself.
3. **Noise Point** — Has NO core points within ε → treated as **outlier** (ignored).

### ⚙️ How Clustering Works

- Core points and their border points form **one cluster**.
- Noise points are left out completely.

### ✅ Advantage Over K-Means

- Can find clusters of **any shape** (not just round blobs).
- Automatically **removes outliers**.
- No need to specify K!

---

## 21. SVM (Support Vector Machine)

### 🎯 What is SVM?

SVM finds the **best hyperplane** to divide two classes AND **maximizes the margin** between the classes.

### 📐 Key Concepts

**Hyperplane:** The dividing line/plane between classes.
```
w^T * x + b = 0
```

**Marginal Planes:** Two parallel planes on either side of the hyperplane, touching the nearest data points.
```
w^T * x + b = +1  (one side)
w^T * x + b = -1  (other side)
```

**Margin = distance between the two marginal planes = 2 / ||w||**

### 🎯 Goal: Maximize the Margin

```
Maximize: 2 / ||w||
```
Which is equivalent to:
```
Minimize: ||w|| / 2
```

Subject to:
```
y(i) * (w^T * x(i) + b) ≥ 1  for all correct points
```

### ⚠️ Hard Margin vs Soft Margin

**Hard Margin SVM:**
- Requires perfect separation with no misclassification.
- Only works if data is perfectly linearly separable (rare in practice).

**Soft Margin SVM:**
- Allows some errors (misclassifications).
- Introduces penalty for violations.
- Final cost function:
  ```
  Minimize: ||w||/2 + C * Σ(ξᵢ)
  ```
  - **C** = penalty hyperparameter (how many errors to allow)
  - **ξᵢ (xi)** = error amount for each misclassified point

### 🔵 SVM Kernel (for Non-Linear Data)

When data is NOT linearly separable (circular patterns etc.):
1. **Transform data to higher dimensions** (2D → 3D)
2. In higher dimensions, a linear hyperplane CAN separate them
3. Popular kernels: **RBF (Radial Basis Function)**, Polynomial, Linear

---

## 22. Bias and Variance — Clear Definitions

### 📖 Exact Definitions

> 💡 Many people get confused here. Read this carefully.

**Bias:**
> "A phenomenon that skews the result of an algorithm **in favor or against** an idea."

- The "idea" = training data
- **High Bias** = model performs well on training data (in favor of it) → **Good for training**
- **Low Bias** = model fails on training data → **Bad**

Wait — this sounds backwards! Let me clarify:

| What we see | Bias term | Variance term |
|---|---|---|
| **Overfitting** | Low Bias (good on train) | High Variance (bad on test) |
| **Underfitting** | High Bias (bad on train) | High Variance (bad on test) |
| **Ideal/Generalized** | Low Bias (good on train) | Low Variance (good on test) |

**Variance:**
> "Refers to the changes in model performance when using different portions of data."

- **High Variance** = model performs very differently on test data vs training data → bad generalization
- **Low Variance** = model performs consistently on both → good generalization

### 📊 The 3 Scenarios

```
Model 1 (Overfitting):
  Train Accuracy = 90%  → Low Bias
  Test Accuracy  = 75%  → High Variance

Model 2 (Ideal/Generalized):
  Train Accuracy = 92%  → Low Bias
  Test Accuracy  = 91%  → Low Variance ✅ ← WE WANT THIS

Model 3 (Underfitting):
  Train Accuracy = 70%  → High Bias
  Test Accuracy  = 65%  → High Variance
```

### 🎯 Our Goal

Always build a **Generalized Model** = Low Bias + Low Variance

This is why we use:
- **Ridge/Lasso** → to reduce overfitting in linear models
- **Random Forest** → combines many decision trees to reduce variance
- **Pruning** → to prevent decision trees from overfitting

---

## 📌 Quick Reference — Algorithm Summary

| Algorithm | Type | Problem | Key Concept |
|---|---|---|---|
| Linear Regression | Supervised | Regression | Best fit line, gradient descent |
| Ridge | Supervised | Regression | L2 regularization, prevent overfitting |
| Lasso | Supervised | Regression | L1 regularization, feature selection |
| Logistic Regression | Supervised | Classification | Sigmoid function, log loss |
| Naive Bayes | Supervised | Classification | Bayes theorem, probability |
| KNN | Supervised | Both | Distance-based, majority vote |
| Decision Tree | Supervised | Both | Information gain, entropy |
| Random Forest | Supervised | Both | Bagging + many decision trees |
| AdaBoost | Supervised | Both | Boosting, stumps, weight updates |
| XGBoost | Supervised | Both | Extreme gradient boosting, binary trees |
| K-Means | Unsupervised | Clustering | Centroids, elbow method |
| Hierarchical | Unsupervised | Clustering | Dendrogram, bottom-up |
| DBSCAN | Unsupervised | Clustering | Density-based, handles outliers |
| SVM | Supervised | Both | Hyperplane, max margin |

---

## 📌 Key Interview Questions & Answers

| Question | Answer |
|---|---|
| What is overfitting? | Model good on train, bad on test — Low Bias, High Variance |
| What is underfitting? | Model bad on both — High Bias, High Variance |
| R² vs Adjusted R²? | Adjusted R² always smaller; adjusts for number of features |
| Ridge vs Lasso? | Ridge: only prevents overfitting; Lasso: also does feature selection |
| Why Gini over Entropy? | Gini is faster (no log computation); use for large datasets |
| Why Random Forest over Decision Tree? | Reduces high variance via bagging |
| Local Minima in Linear Regression? | No — its cost function is always convex |
| Is KNN affected by outliers? | Yes |
| Is standardization needed for KNN? | Yes (distance-based) |
| Is standardization needed for Decision Tree? | No |
| Is Random Forest a black box? | Yes |
| Is Decision Tree a white box? | Yes |
| Precision vs Recall use case? | Cancer → Recall; Spam → Precision; Both → F1 Score |
| What is a weak learner? | A model slightly better than random (e.g., 1-level decision tree/stump) |

---

*Notes compiled from Krish Naik's complete Machine Learning course — covers all algorithms from Linear Regression to DBSCAN in one place.*
