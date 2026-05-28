# ☁️ Cloud Computing Fundamentals — Complete Notes
> Key concepts explained clearly in one flow — great for beginners and as a refresher.

---

## 📌 Table of Contents
1. [Scaling — Vertical vs Horizontal](#1-scaling--vertical-vs-horizontal)
2. [Load Balancing](#2-load-balancing)
3. [Autoscaling](#3-autoscaling)
4. [Serverless](#4-serverless)
5. [Event Driven Architecture (EDA)](#5-event-driven-architecture-eda)
6. [Container Orchestration](#6-container-orchestration)
7. [Storage — Three Types](#7-storage--three-types)
8. [Availability](#8-availability)
9. [Durability](#9-durability)
10. [Infrastructure as Code (IaC)](#10-infrastructure-as-code-iac)
11. [Cloud Networks (VPC)](#11-cloud-networks-vpc)
12. [Quick Reference — All Key Terms](#12-quick-reference--all-key-terms)

---

## 1. Scaling — Vertical vs Horizontal

### The Problem

You build an app. In the beginning, traffic is near zero. Then suddenly a blog post features it, or it goes viral, and traffic explodes almost instantly. Most apps aren't built to handle this sudden spike — users start seeing errors, the app slows down or crashes completely.

**Cloud computing's biggest benefit is that it lets you scale to handle this — seamlessly.**

There are two ways to scale:

---

### Vertical Scaling (Scale Up)

The **traditional approach** (pre-cloud, but still available in cloud today).

**Idea:** Make your one machine bigger and more powerful.
- Add more CPU cores
- Add more RAM (memory)
- Add more disk space
- Increase network throughput

**Analogy:** You have one worker. Instead of hiring more workers, you give the same worker superhuman strength.

**The two problems with vertical scaling:**

**Problem 1 — Diminishing Returns on Cost**

When you buy computer parts, larger components cost disproportionately more:
- 16 GB RAM stick → $100
- 32 GB RAM stick → $225 (not $200, you'd expect)
- 64 GB RAM stick → $500–600 (not $450)

So the more you scale up a single machine, the more **expensive** it gets per unit of performance. You get **diminishing returns**.

**Problem 2 — Stability / Single Point of Failure**

If that one powerful machine goes down for any reason — your **entire application is down**. There's nothing else to serve traffic. One failure = total outage.

---

### Horizontal Scaling (Scale Out)

The **modern cloud approach**.

**Idea:** Instead of making one machine bigger, clone your application and run it on **many smaller, cheaper machines**.

```
Vertical:                    Horizontal:
[ HUGE machine ]             [ small ] [ small ] [ small ]
                             [ small ] [ small ]
```

**How it solves both problems:**

**Problem 1 — Cost ✅**
Smaller machines cost far less per unit. Five machines with 16 GB RAM each is much cheaper than one machine with 64 GB RAM (which has price inflation built in).

**Problem 2 — Stability ✅**
If one of your five machines goes down, the other four are still alive and serving traffic. Your application keeps running — just slightly reduced capacity. Users don't even notice.

> 💡 Horizontal scaling is the most popular approach in modern cloud computing. It's what makes cloud platforms like AWS, GCP, and Azure so powerful.

---

## 2. Load Balancing

### The Problem It Solves

With vertical scaling (one machine), routing traffic is trivial — everything goes to that one IP address. But with **horizontal scaling (multiple machines)**, a new question arises:

> "When a user makes a request, which of my five machines should handle it?"

You also need answers to:
- Which machines are healthy right now?
- Which machines are overloaded?
- If a machine goes down, how do we stop sending traffic to it?

This is exactly what a **Load Balancer** handles.

### What is a Load Balancer?

A Load Balancer is a **layer that sits in front of all your application instances**. It has its own DNS name or IP address. All incoming traffic hits the load balancer first, and the load balancer decides which backend machine to forward each request to.

```
               [Internet traffic]
                       ↓
               [LOAD BALANCER]
              ↙    ↓    ↓    ↘
        [M1]  [M2]  [M4]  [M5]
              (M3 is down — skipped)
```

### Load Balancing Algorithms

The load balancer uses different strategies to pick which machine gets each request:

**1. Round Robin**
Just cycle through machines in order: M1 → M2 → M4 → M5 → M1 → M2 → ...
(skips any that are down). Simple, equal distribution.

**2. Least Connections**
Send the request to whichever machine currently has the fewest active connections.
- M1 has 10 connections
- M2 has 20 connections
- M3 has 30 connections
→ New request goes to M1

**3. Least Utilization (Resource-Based)**
Send to the machine with the lowest resource usage:
- M1: 99% CPU
- M2: 50% CPU
- M3: 20% CPU
→ New request goes to M3

> 💡 Load balancing is always used **together** with horizontal scaling. One doesn't make sense without the other.

---

## 3. Autoscaling

### The Problem

With horizontal scaling, you manually decide how many machines to run — say, 3 instances. But:
- What happens when traffic suddenly spikes? 3 instances may not be enough.
- What happens when traffic drops after a peak? You're paying for 3 instances when you only need 1.

You don't want to be sitting at your monitor watching traffic graphs and manually adding/removing machines all day.

### What is Autoscaling?

**Autoscaling = automatically adding or removing instances in response to fluctuating traffic or resource exhaustion.**

You define rules once, and the cloud provider handles it for you automatically:
- Traffic spikes → more instances are added
- Traffic drops → extra instances are removed (you stop paying for them)

```
Traffic →  [__/‾‾‾‾‾\___]
Instances →[_/‾‾‾‾‾‾‾\__]   ← automatically scales up and down
```

### How It Works (AWS Example)

In AWS, this is done via **Autoscaling Groups (ASG)**:
1. Create a group of instances that can live within it
2. Set a **metric** (trigger condition):
   - "When CPU utilization exceeds 70%, add one more instance"
   - "When connections drop below 100, remove an instance"
3. Set min/max limits (e.g., always keep at least 2 instances, never exceed 10)
4. AWS handles the rest automatically

> 💡 Autoscaling is where you get the real financial power of cloud computing — you only pay for what you use, exactly when you use it.

---

## 4. Serverless

### The Original Definition (True Serverless)

Serverless became popular with **AWS Lambda**.

**The old problem:** To run code in the cloud, you had to:
1. Provision an EC2 instance (rent a virtual machine from AWS)
2. Configure it (security, networking, OS)
3. Load your code onto it
4. Manage and maintain it ongoing

This was a pain. Most developers just want to **write code and run it** — they don't want to manage servers.

**What Lambda did:** Introduced the concept of a **Lambda Function**:
- You write your code
- You upload it to a "Lambda function" (an abstract entity, not a specific machine)
- You don't know or care which underlying EC2 instance runs it — Lambda manages that invisibly
- Lambda automatically scales up instances when traffic increases, scales down when not needed
- You **pay per execution** — if nobody calls your function, you pay nothing

```
Developer writes code
         ↓
   [Lambda Function]  ← abstract, no visible servers
      /    |    \
   [EC2] [EC2] [EC2]  ← managed invisibly by AWS
```

This was the true meaning of serverless: **no visible server infrastructure, pay only for what you use**.

### How "Serverless" is Used Today (Evolved/Diluted Meaning)

AWS and other providers started calling other services "serverless" even when they don't fully match the original definition. Example: **AWS OpenSearch Serverless**:

- Old OpenSearch: You manually configure master nodes, data nodes, instance types, etc.
- OpenSearch Serverless: AWS manages the underlying instances for you — you don't configure them
- BUT: You still pay for the number of underlying instances (not per-execution)
  - Low traffic → 2 instances → $200/month
  - High traffic → 6 instances → $600/month

This is very different from Lambda's pay-per-execution model — yet AWS calls it "serverless."

### The Key Takeaway

> ⚠️ Be careful with the term "serverless" — it means different things in different contexts.
> - **True serverless** (Lambda-style): no visible infrastructure, pay per execution, scales to zero
> - **Modern serverless** (AWS's expanded use): managed infrastructure you don't configure, but you still pay for underlying resources

---

## 5. Event Driven Architecture (EDA)

### The Old Way — Request/Response Model

Consider an e-commerce app like Amazon. When a customer places an order, the system needs to:
1. Charge the customer (call Credit Card Service)
2. Trigger fulfillment (call Warehouse/FC Service)
3. Check for fraud (call Fraud Detection Service)

**Old approach (Request/Response / Synchronous):**
```
Order Service calls → Credit Card Service
Order Service calls → FC Service
Order Service calls → Fraud Service
```

The Order Service **synchronously calls each dependency one by one** and waits for each response before proceeding.

**The problem: Tight Coupling**
The Order Service needs to know about every downstream service:
- It has to know the Credit Card service exists and how to call it
- It has to know the FC service exists and how to call it
- If you add a new service (e.g., Analytics), you have to modify the Order Service
- If any downstream service is slow or fails, it can block the whole order flow

---

### The New Way — Event Driven Architecture

**Core idea:** Instead of the Order Service calling each downstream service directly, it **publishes a message (event)** to a central notification engine. Any service that cares about that event **subscribes** to it and reacts independently.

```
Order placed
     ↓
[Order Service] → publishes → [SNS Topic / Event Bus]
                                    ↙    ↓    ↘
                           [Credit  ] [FC    ] [Fraud  ]
                           [Card    ] [Service] [Service]
                           [Service ]
```

In AWS, the notification engine is either:
- **SNS (Simple Notification Service)** — fan-out notifications
- **EventBridge (EB)** — more powerful event routing

### The Event/Message

Think of the message as an **envelope** containing all the details:
```json
{
  "order_id": "123",
  "amount": 100.00,
  "customer_id": "cust_456",
  "items": [...]
}
```

### Key Benefit — Decoupling

The Order Service **no longer needs to know** about downstream services:
- Credit Card processing comes and goes — Order Service doesn't care
- New service added (e.g., Loyalty Points) — just subscribe it to the event bus
- Order Service code stays completely unchanged

This is called **decoupling** — the producer of events and the consumers are independent.

**Fanning out:** You can add unlimited subscribers with no changes to the publisher.

### Handling Complexity

EDA introduces new complexity: what if Credit Card succeeds but Fraud Detection flags the order as fraudulent after the fact?

**Solution:** Publish a new "Order Cancelled" event, and all subscribers react to it (issue refund, stop fulfillment, etc.). This is a known complexity of EDA with established patterns to handle it.

### Key Terms

| Term | Meaning |
|---|---|
| **Publisher** | The service that creates and sends the event (e.g., Order Service) |
| **Subscriber** | Services that receive and react to the event (Credit Card, FC, Fraud) |
| **Pub/Sub** | Short form of Publisher/Subscriber — the core pattern of EDA |
| **Fan-out** | One publisher → many subscribers |
| **Decoupling** | Publisher doesn't need to know who the subscribers are |
| **Tight Coupling** | Old way — publisher knows every subscriber and calls them directly |

> 💡 EDA is becoming more and more common in cloud computing because it allows systems to scale independently and add new features without touching existing services.

---

## 6. Container Orchestration

### Brief Recap: What are Containers?

A container is an **isolated, portable environment** that packages your app with all its dependencies (code, libraries, config, runtime). You can build it on your laptop and run it identically on any server, cloud instance, or your friend's computer.

**Solves the "works on my machine" problem** — if it runs in the container on your laptop, it runs the same everywhere.

### The Problem Without Orchestration

Say you deploy a container onto an EC2 instance on AWS. Simple. But problems arise:
- Container crashes or runs out of memory → you have to detect and restart it manually
- Deploying new code → complicated process
- Want 5 copies of the container on 5 different machines → manual setup for each
- One container goes down → no automatic traffic rerouting

Managing containers **manually** across many machines is a nightmare.

### What is Container Orchestration?

Container orchestration services **simplify and automate** the deployment, scaling, and management of containers.

**AWS provides two main orchestration services:**

| Service | Full Name | Notes |
|---|---|---|
| **ECS** | Elastic Container Service | AWS-native, simpler |
| **EKS** | Elastic Kubernetes Service | Kubernetes-based, more powerful |

### What Orchestration Does For You

- **Deploy to multiple machines** at once — "I want 3 copies of this container running"
- **Provision a load balancer** automatically to distribute traffic
- **Health checks** — continuously monitor containers; replace unhealthy ones automatically
- **Auto-remove failed instances** — if a container crashes, remove it from the load balancer so traffic flows only to healthy ones
- **Monitoring and availability** — built-in dashboards
- **Easy deployments** — roll out new code with zero downtime

> 💡 Container orchestration makes it as easy to run 50 containers across 50 machines as it is to run one. This is one of the core superpowers of modern cloud architecture.

---

## 7. Storage — Three Types

Storage in cloud is not just one thing — there are three distinct types, each with different use cases.

---

### Type 1 — Object Storage

**What it is:** A general-purpose dumping ground for files of any kind.

**What you store here:**
- Media files: MP4 videos, audio files, images
- Data files: JSON, CSV, XML
- Blobs: any binary data
- Config files, log files, backups

**Old way:** Attach a disk/volume to your server and store files there. Problem: tied to one server, hard to access from elsewhere.

**Cloud way:** Object storage (like **AWS S3**) lives independently in the cloud. Any application, anywhere, can access it. It scales automatically. You pay per GB stored.

**Key property:** Accessed via a URL/API — not like a file system.

---

### Type 2 — Block Storage

**What it is:** A virtual hard drive (volume) that you attach to a cloud instance.

Think of it like a hard drive in your laptop — but it lives in the cloud and can be:
- **Resized** automatically (scale up when you need more space)
- **Shared** across multiple instances (the same volume attached to 3 different EC2 instances simultaneously)
- **Detached and reattached** to different instances

**Use case:** You need temporary large storage for a machine learning training job — provision a large volume, run the job, then release it (stop paying for it).

**Key difference from object storage:** Block storage is like a file system you mount. Object storage is like a URL-addressable bucket.

---

### Type 3 — Databases

The most commonly used type of cloud storage. Several categories:

**Relational Databases (SQL)**
Traditional table-based databases using SQL.
- PostgreSQL, MySQL, Microsoft SQL Server, Oracle
- AWS RDS, Aurora
- Best for structured data with relationships (orders, customers, products)

**NoSQL Databases**
A broad category covering many types of databases that don't use traditional SQL table structure:
- **Document stores**: MongoDB, DynamoDB — store JSON-like documents
- **Search engines**: OpenSearch / Elasticsearch — optimized for text search
- **Graph databases**: store relationship-heavy data (social networks)
- Best for unstructured or semi-structured data, high-speed access

**Cache**
Temporary in-memory data storage. Not quite a database but closely related.
- Data lives in RAM (very fast)
- Applications use cache to store frequently accessed data so they don't have to hit the database every time (database calls are slow and expensive)
- Examples: Redis, Memcached, AWS ElastiCache
- Data is ephemeral — it can be lost if the cache restarts

```
Summary:
┌─────────────────────────────────────────────────────┐
│ STORAGE TYPES                                        │
│                                                      │
│ Object Storage → Files, media, blobs (S3)           │
│ Block Storage  → Virtual hard drives, volumes       │
│ Databases      → Relational (SQL) / NoSQL / Cache   │
└─────────────────────────────────────────────────────┘
```

---

## 8. Availability

### What is Availability?

**Availability = how often is your application up and running, expressed as a percentage.**

Cloud providers often advertise availability as a string of nines:
- `99.9%` = about 8.7 hours of downtime per year
- `99.99%` = about 52 minutes of downtime per year
- `99.999%` = about 5 minutes of downtime per year

The more nines, the more uptime — and generally the more expensive.

### How to Increase Availability

**1. Horizontal Scaling + Load Balancing**
Run multiple instances. If one goes down, load balancer routes traffic to the rest. Already covered above.

**2. Availability Zones (AZs)**

An **Availability Zone** is a physically separate data center (or a separate partition of a building) with:
- Separate power lines
- Separate internet lines
- Separate everything

AWS guarantees that if one AZ goes down (power outage, network issue), other AZs are unaffected.

**Strategy:** Spread your instances across multiple AZs:
```
AZ-1: Instance 1, Instance 2
AZ-2: Instance 3, Instance 4
AZ-3: Instance 5
```

If AZ-1 completely loses power, your app is still running in AZ-2 and AZ-3. Load balancer automatically routes traffic there.

> 💡 Multi-AZ deployment is one of the most effective ways to achieve high availability. Most production applications should use at least two AZs.

---

## 9. Durability

### What is Durability?

**Durability = will my data survive hardware failures?** Will I ever permanently lose data that I store in the cloud?

Durability is specifically about **data persistence**, not uptime.

### How Cloud Providers Ensure Durability

When you store a file (or any data) in a cloud service like S3, AWS **automatically stores multiple copies** of it:
- Copy 1: Data center A
- Copy 2: Data center B
- Copy 3: Data center C (possibly different country)

**Worst case scenario:** The hard drive hosting Copy 1 catches fire and is completely destroyed.
- AWS automatically detects this
- Creates a new copy somewhere else
- You never lose your data

**AWS S3 Durability:** 99.999999999% (11 nines) — statistically, if you store 10 million files, you'd expect to lose one file every 10,000 years.

### Availability vs Durability — The Difference

| | Availability | Durability |
|---|---|---|
| **Question** | Is my app accessible right now? | Is my data safe from permanent loss? |
| **About** | Uptime of the service | Safety of stored data |
| **Example failure** | Server crashes → app is down temporarily | Hard drive explodes → data is gone forever |
| **Measured by** | % uptime (99.99%) | % data integrity (99.999999999%) |

> 💡 A service can be temporarily unavailable (low availability) but your data is still safe (high durability). These are separate concerns.

---

## 10. Infrastructure as Code (IaC)

### The Old Way — Clicking in the Console

Before IaC, to set up a database on AWS you would:
1. Log into AWS Console
2. Navigate to DynamoDB
3. Click "Create table"
4. Fill in settings (table name, partition key, indexes, billing mode...)
5. Set up monitoring
6. Add data
7. Come back later and modify configs

**Problems with this approach:**

**Problem 1 — Easy to Make Mistakes**
It's easy to accidentally click the wrong button, fat-finger a value, or hit "delete" on a production resource. One click can take down your entire application.

**Problem 2 — Hard to Replicate**
Your app starts in North America. Six months later, you need to expand to Europe with the exact same setup. You have to manually go through the console and recreate everything from scratch — time-consuming and error-prone.

**Problem 3 — No Audit Trail**
Anyone with console access could make changes and you'd never know. No history, no reviews, no accountability.

---

### The New Way — Infrastructure as Code

**IaC = define all your infrastructure in code instead of clicking in the console.**

```python
# Example CDK (Python): create a DynamoDB table
table = aws_dynamodb.Table(
    self, "OrdersTable",
    table_name="orders",
    partition_key=aws_dynamodb.Attribute(
        name="order_id",
        type=aws_dynamodb.AttributeType.STRING
    ),
    billing_mode=aws_dynamodb.BillingMode.PAY_PER_REQUEST
)
```

You write this code, commit it to Git, and hand it off to the cloud provider. AWS reads your code and creates the infrastructure for you.

**Benefits:**

**1. Fewer Mistakes**
Code has to go through pull requests and code reviews before anyone touches production. No more accidental console clicks.

**2. Easy to Replicate**
Want to deploy the same setup in Europe? Just specify the region and run the same code. Two commands and you're done.

**3. Version Control**
All infrastructure changes are tracked in Git. You can see who changed what, when, and why. You can roll back to a previous version.

**4. Consistency**
Dev, staging, and production environments are created from the same code — no more "it works in dev but not in prod" because of different configs.

---

### IaC Tools

**AWS CloudFormation (CF)**
- AWS-native
- Uses YAML or JSON templates
- **Declarative** — you describe the desired final state, AWS figures out how to get there
- Example: "I want 3 EC2 instances of type t3.medium"

**AWS CDK (Cloud Development Kit)** ← Recommended
- Also AWS-native
- Uses real programming languages (Python, TypeScript, Java, etc.)
- **Imperative** — you write logic with for loops, if statements, conditions
- More flexible than CloudFormation
- Example: Loop through regions and create different-sized instances based on environment (dev vs prod)

**Terraform**
- **Third-party**, not tied to any cloud provider
- Works with AWS, GCP, Azure, and many others — one tool for all clouds
- Very popular when your company uses multiple cloud providers
- Why people love it: write once, deploy anywhere

> 💡 If you're using only AWS: **CDK is the top recommendation**. If you're using multiple cloud providers: **Terraform is the way to go**.

---

## 11. Cloud Networks (VPC)

### Traditional Networks (Pre-Cloud)

A company's old networking setup:
- Physical server room / data center on-site
- Some servers exposed to the internet (public subnet) — e.g., web servers
- Some servers hidden from the internet (private subnet) — e.g., databases
- Security groups defined rules: "the web server can talk to the database, but the internet cannot talk directly to the database"

This worked but required physical hardware, dedicated networking staff, and was hard to scale or replicate.

---

### Cloud Networks (VPC — Virtual Private Cloud)

In the cloud, **thousands of companies share the same physical AWS data centers**. A VPC is what separates them.

**What is a VPC?**
A VPC is a **logically isolated section of the cloud** that belongs to you. Think of it as your own private slice of AWS.

```
┌─────────────────── AWS ─────────────────────┐
│                                              │
│  [Your VPC]    [Company B VPC]   [Jeff's VPC]│
│  (private to   (private to       (private to │
│   you)          them)            him)        │
│                                              │
└─────────────────────────────────────────────┘
```

**Default behavior: complete isolation**
- Your VPC cannot talk to Company B's VPC — not allowed by default
- Traffic from the internet cannot reach your resources inside the VPC — not allowed by default
- You must explicitly define what's allowed in and out

**Inside your VPC, you can:**
- Create **public subnets** (accessible from internet) — for web servers, load balancers
- Create **private subnets** (not accessible from internet) — for databases, sensitive data
- Define **security groups** — rules like "the web server can talk to the database, but internet cannot reach the database directly"
- **VPC Peering** — connect two VPCs together (e.g., yours and a partner company's) so they can communicate, while still keeping other things private

**Traditional network vs Cloud network — same concepts, different implementation:**

| Concept | Traditional | Cloud (VPC) |
|---|---|---|
| Isolation | Physical separate hardware | Logical software isolation |
| Setup | Physical cables, switches | Few clicks or IaC code |
| Subnets | Physical network segments | Virtual subnet CIDR blocks |
| Security groups | Physical firewalls | Virtual firewall rules |
| Scaling | Buy new hardware | Instant, on-demand |

> 💡 VPCs are a fundamental building block of cloud security. Every serious cloud deployment should have a properly configured VPC with public/private subnet separation.

---

## 12. Quick Reference — All Key Terms

| Term | Simple Meaning |
|---|---|
| **Scaling** | Adjusting your application's capacity to handle more or less traffic |
| **Vertical Scaling** | Making one machine bigger (more CPU, RAM) — expensive, single point of failure |
| **Horizontal Scaling** | Running multiple smaller machines — cheaper, more reliable |
| **Diminishing Returns** | Adding more to one machine costs more per unit as you go bigger |
| **Single Point of Failure** | One machine = if it fails, everything fails |
| **Load Balancer** | Layer in front of your instances that distributes incoming traffic among them |
| **Round Robin** | Load balancing algorithm: cycle through machines evenly in order |
| **Least Connections** | Load balancing: send to machine with fewest active connections |
| **Autoscaling** | Automatically add/remove instances based on traffic or resource usage |
| **Autoscaling Group (AWS)** | AWS feature to define min/max instances and scale on a chosen metric |
| **Serverless (true)** | No visible server management, pay per execution (e.g., AWS Lambda) |
| **Lambda Function** | AWS Lambda's unit of code — runs without you managing the underlying server |
| **EC2** | AWS service to rent a virtual machine instance |
| **EDA** | Event Driven Architecture — services communicate via events, not direct calls |
| **Event** | A message published when something happens (e.g., "order placed") |
| **Publisher** | Service that creates and sends an event |
| **Subscriber** | Service that receives and reacts to an event |
| **Pub/Sub** | Publisher/Subscriber — the core EDA pattern |
| **Fan-out** | One publisher event distributed to many subscribers |
| **Tight Coupling** | Services that directly depend on each other — hard to change independently |
| **Decoupling** | Services that communicate via events — changes to one don't break others |
| **SNS** | AWS Simple Notification Service — fan-out notifications to subscribers |
| **EventBridge (EB)** | AWS event bus — routes events between services |
| **Container** | Isolated, portable package of code + dependencies (Docker) |
| **Container Orchestration** | Automated management of containers across multiple machines |
| **ECS** | AWS Elastic Container Service — AWS-native container orchestration |
| **EKS** | AWS Elastic Kubernetes Service — Kubernetes-based container orchestration |
| **Object Storage** | Store any files/media/blobs accessible via URL (e.g., AWS S3) |
| **Block Storage** | Virtual hard drives (volumes) attached to instances |
| **Relational DB** | SQL-based structured databases (PostgreSQL, MySQL, RDS) |
| **NoSQL** | Non-relational databases (MongoDB, DynamoDB, OpenSearch) |
| **Cache** | In-memory temporary fast storage (Redis, ElastiCache) |
| **Availability** | % of time your application is up and running (99.9%, 99.99%...) |
| **Availability Zone (AZ)** | Physically isolated data center partition within a cloud region |
| **Multi-AZ** | Deploying instances across multiple AZs for high availability |
| **Durability** | Will your data survive hardware failures? (data safety, not uptime) |
| **Replication** | Storing multiple copies of data across different locations |
| **IaC** | Infrastructure as Code — define cloud resources in code, not console clicks |
| **CloudFormation** | AWS IaC tool — declarative YAML/JSON templates |
| **CDK** | AWS Cloud Development Kit — IaC using real programming languages |
| **Terraform** | Third-party IaC tool that works across AWS, GCP, Azure |
| **Declarative IaC** | Describe desired end state; tool figures out how to achieve it |
| **Imperative IaC** | Write step-by-step logic (for loops, conditions) to build infrastructure |
| **VPC** | Virtual Private Cloud — your logically isolated section of the cloud |
| **Public Subnet** | VPC subnet accessible from the internet (web servers, load balancers) |
| **Private Subnet** | VPC subnet NOT accessible from internet (databases, sensitive data) |
| **Security Group** | Virtual firewall rules controlling what traffic is allowed in/out |
| **VPC Peering** | Connecting two VPCs so they can communicate with each other |

---

## The Big Picture — How These Concepts Connect

```
User Traffic
     ↓
[LOAD BALANCER]         ← distributes incoming requests
   ↙  ↓  ↓  ↘
[M1][M2][M3][M4]        ← horizontal scaling (multiple instances)
                        ← autoscaling adds/removes these automatically
                        ← all live inside a VPC (isolated network)
                        ← deployed across multiple Availability Zones

Each machine runs:
[CONTAINER]             ← container orchestration (ECS/EKS) manages them

When an order is placed:
[Service] → publishes → [SNS/EventBridge] → fans out to subscribers
                         ↓ EDA decouples services

Data is stored in:
[Object Storage]  → files, media
[Block Storage]   → volumes
[Databases]       → relational / NoSQL / cache

Infrastructure defined via:
[IaC (CDK/Terraform)] → code in Git, reviewed, version-controlled

All measured by:
[Availability]   → % uptime
[Durability]     → data safety
```

---

*Notes from cloud computing fundamentals video — covering all 11 core concepts: vertical vs horizontal scaling, load balancing, autoscaling, serverless (true definition + modern diluted usage), event driven architecture (pub/sub, decoupling, SNS, EventBridge), container orchestration (ECS/EKS), three types of storage (object/block/database+cache), availability with availability zones, durability with data replication, IaC with CloudFormation/CDK/Terraform, and VPC cloud networks with subnets and security groups.*
