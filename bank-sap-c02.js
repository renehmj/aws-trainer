/*
 * SAP-C02 — Solutions Architect Professional question bank.
 *
 * Domains and weights (must match certs.js exactly):
 *   "Design Solutions for Organizational Complexity"    26%
 *   "Design for New Solutions"                          29%
 *   "Continuous Improvement for Existing Solutions"     25%
 *   "Accelerate Workload Migration and Modernization"   20%
 *
 * Exam: 75 questions, 180 minutes, pass 750/1000.
 *
 * Professional-level questions turn on trade-offs rather than service recall:
 * expect several technically workable options where only one meets every stated
 * constraint. Copy topic strings verbatim from certs.js.
 */

window.BANKS = window.BANKS || {};
window.BANKS["SAP-C02"] = [

  /* ---------- Design Solutions for Organizational Complexity (26%) ---------- */

  {
    id: "org-001",
    domain: "Design Solutions for Organizational Complexity",
    topic: "Multi-account strategy with Control Tower",
    difficulty: "medium",
    type: "single",
    question:
      "A group with 12 existing AWS accounts is expanding to roughly 80 over two years. They need a governed landing zone with mandatory guardrails, centralised logging, and a self-service way for business units to request new accounts that are compliant from the moment they are created. The platform team is four people. Which approach fits?",
    options: [
      { id: "A", text: "Deploy AWS Control Tower, enrol the existing accounts, and use Account Factory for new account provisioning." },
      { id: "B", text: "Write a CloudFormation StackSet that applies baseline resources, and have the platform team create each account manually through Organizations." },
      { id: "C", text: "Create a single large account with one VPC per business unit, separated by IAM policies and tagging." },
      { id: "D", text: "Use AWS Organizations with SCPs only, and let each business unit configure its own logging and baselines." }
    ],
    correct: ["A"],
    explanation:
      "Control Tower is the managed landing zone: it sets up the organizational units, the log archive and audit accounts, and preventive and detective guardrails, and Account Factory gives business units a self-service path that produces a compliant account every time. That is what lets four people govern 80 accounts.",
    whyWrong: {
      B: "StackSets can apply a baseline but the team still hand-builds the landing zone, the guardrail framework and the account request process — a large amount of undifferentiated work Control Tower already does.",
      C: "A single account gives no blast-radius separation, no per-unit billing boundary, and no service quota isolation; it is the opposite of a multi-account strategy.",
      D: "SCPs restrict permissions but do not provision accounts, centralise logging, or provide detective controls, and delegating baselines to each unit guarantees drift."
    }
  },

  {
    id: "org-002",
    domain: "Design Solutions for Organizational Complexity",
    topic: "Network topology with Transit Gateway",
    difficulty: "hard",
    type: "single",
    question:
      "An organization runs 40 VPCs across four accounts in one Region, plus two Direct Connect links to on-premises. Traffic between any VPC and on-premises must pass through a central inspection firewall, and VPC-to-VPC traffic must be blocked by default except for specific approved pairs. Which design meets this?",
    options: [
      { id: "A", text: "A Transit Gateway with separate route tables per segment, an inspection VPC hosting the firewall via Gateway Load Balancer, and Direct Connect attached through a Transit VIF." },
      { id: "B", text: "Full-mesh VPC peering between all 40 VPCs, with routes to the firewall VPC added to every route table." },
      { id: "C", text: "A Transit Gateway with a single default route table shared by all attachments and a security group referencing the firewall." },
      { id: "D", text: "AWS PrivateLink endpoints between every pair of VPCs, with Direct Connect terminating in each VPC." }
    ],
    correct: ["A"],
    explanation:
      "Transit Gateway route tables are the segmentation mechanism: attachments associated with different route tables cannot reach each other unless routes are explicitly propagated, which gives deny-by-default with approved exceptions. Sending inter-domain traffic through an inspection VPC running the firewall behind a Gateway Load Balancer inserts the appliance centrally, and a Transit VIF connects Direct Connect to the same hub.",
    whyWrong: {
      B: "Full-mesh peering across 40 VPCs means 780 connections to build and maintain, peering is non-transitive so it cannot chain through a firewall, and route table sprawl makes the policy unauditable.",
      C: "A single shared route table means every attachment can reach every other — precisely the default-open behaviour the requirement forbids — and security groups do not apply to Transit Gateway attachments.",
      D: "PrivateLink exposes individual services, not general VPC-to-VPC routing, and Direct Connect cannot terminate in every VPC at this scale without a gateway."
    }
  },

  {
    id: "org-003",
    domain: "Design Solutions for Organizational Complexity",
    topic: "Centralized identity and federation",
    difficulty: "medium",
    type: "single",
    question:
      "A company federates workforce identities into AWS through IAM Identity Center. Auditors now require that a specific set of production accounts can only be accessed by engineers who are members of an on-call group, that access is time-bounded, and that every session is attributable to a named person. What should the architect implement?",
    options: [
      { id: "A", text: "Assign a permission set to the on-call group for those accounts only, and rely on Identity Center's short-lived sessions with CloudTrail recording the federated identity." },
      { id: "B", text: "Create a shared IAM user in each production account whose password is held in a password manager available to the on-call engineers." },
      { id: "C", text: "Grant every engineer a permanent administrator permission set and audit their activity monthly." },
      { id: "D", text: "Use an EC2 bastion host in each production account with SSH keys distributed to on-call staff." }
    ],
    correct: ["A"],
    explanation:
      "Permission sets are assigned to groups and scoped to specific accounts, so membership of the on-call group is what grants access. Identity Center issues short-lived credentials rather than long-lived keys, and CloudTrail records the federated user identity, satisfying time-bounding and attribution together.",
    whyWrong: {
      B: "A shared credential destroys attribution — CloudTrail would show the same principal for everyone — and creates a long-lived secret.",
      C: "Standing administrator access to production for all engineers fails the least-privilege requirement, and monthly review is detection long after the fact.",
      D: "Bastion hosts with distributed SSH keys give infrastructure access outside IAM, with keys that are hard to attribute and revoke."
    }
  },

  {
    id: "org-004",
    domain: "Design Solutions for Organizational Complexity",
    topic: "Cross-account resource sharing with RAM",
    difficulty: "medium",
    type: "single",
    question:
      "A platform team owns the network account containing a VPC with well-designed subnets. Application teams in separate accounts must deploy EC2 instances and load balancers into those subnets without the platform team giving up control of routing, NAT gateways or the VPC itself. What should be used?",
    options: [
      { id: "A", text: "AWS Resource Access Manager to share the specific subnets with the application accounts, using VPC sharing." },
      { id: "B", text: "VPC peering between the network account VPC and a new VPC in each application account." },
      { id: "C", text: "Cross-account IAM roles that let application teams create resources in the network account." },
      { id: "D", text: "A Transit Gateway attachment from each application account's own VPC." }
    ],
    correct: ["A"],
    explanation:
      "VPC sharing through RAM lets the owning account share individual subnets with participant accounts. Participants launch resources into those subnets in their own accounts, while the owner retains sole control of the VPC, its route tables, gateways and peering — exactly the split described.",
    whyWrong: {
      B: "Peering connects separate VPCs; each application team would still own and operate its own VPC, duplicating the NAT and routing design the platform team wants to centralise.",
      C: "This puts application resources in the network account, mixing ownership, billing and blast radius, and gives application teams rights inside the platform account.",
      D: "Transit Gateway routes between VPCs but again assumes each team runs its own VPC, rather than deploying into shared subnets."
    }
  },

  /* ---------- Design for New Solutions (29%) ---------- */

  {
    id: "new-001",
    domain: "Design for New Solutions",
    topic: "Business continuity and RTO/RPO design",
    difficulty: "hard",
    type: "single",
    question:
      "A payments platform must survive the loss of an entire Region with an RTO of 5 minutes and an RPO of near zero. The business will fund duplicate infrastructure but wants both Regions doing useful work rather than one sitting idle. Which architecture matches?",
    options: [
      { id: "A", text: "Active/active in two Regions with Route 53 or Global Accelerator distributing traffic, and a data tier replicating synchronously or near-synchronously across both." },
      { id: "B", text: "Warm standby, with a scaled-down copy of the stack in the second Region scaled up on failover." },
      { id: "C", text: "Pilot light, with data replicated continuously and application servers switched off until needed." },
      { id: "D", text: "Backup and restore, with hourly snapshots copied cross-Region." }
    ],
    correct: ["A"],
    explanation:
      "Only active/active serves traffic from both Regions, which is the stated requirement that neither sits idle, and it is the strategy that supports an RTO measured in minutes with near-zero RPO because the second Region is already live and current.",
    whyWrong: {
      B: "Warm standby can approach a 5-minute RTO but the standby is deliberately under-utilised, failing the requirement that both Regions do useful work.",
      C: "Pilot light leaves compute switched off, so recovery involves provisioning and starting the stack — too slow for a 5-minute RTO.",
      D: "Hourly snapshots give an RPO of up to an hour and a restore-driven RTO of far more than 5 minutes."
    }
  },

  {
    id: "new-002",
    domain: "Design for New Solutions",
    topic: "Multi-Region resilience patterns",
    difficulty: "hard",
    type: "single",
    question:
      "A relational workload needs cross-Region disaster recovery with an RPO of about one second and an RTO under one minute, with replication managed by AWS rather than by the application. Which data tier should the architect choose?",
    options: [
      { id: "A", text: "Amazon Aurora Global Database, with a secondary Region that can be promoted quickly." },
      { id: "B", text: "Amazon RDS for PostgreSQL with a cross-Region read replica promoted manually on failure." },
      { id: "C", text: "Amazon DynamoDB global tables." },
      { id: "D", text: "Amazon RDS Multi-AZ with automated backups copied to a second Region." }
    ],
    correct: ["A"],
    explanation:
      "Aurora Global Database replicates at the storage layer with typical cross-Region lag under a second and supports promoting a secondary Region in well under a minute, with AWS managing the replication. That combination is what the stated RPO and RTO require from a relational engine.",
    whyWrong: {
      B: "Cross-Region read replicas use asynchronous logical replication with higher and more variable lag, and manual promotion typically takes several minutes.",
      C: "DynamoDB global tables meet the replication targets but are non-relational, so they do not satisfy a relational workload.",
      D: "Multi-AZ protects against Availability Zone loss only, and restoring cross-Region backups is measured in hours."
    }
  },

  {
    id: "new-003",
    domain: "Design for New Solutions",
    topic: "Data store selection at scale",
    difficulty: "medium",
    type: "single",
    question:
      "An industrial platform ingests 2 million sensor readings per minute. Queries are almost always \"the values for this sensor over this time window\", data older than two years can be dropped automatically, and the team wants to avoid managing shards or capacity. Which store fits best?",
    options: [
      { id: "A", text: "Amazon Timestream, a purpose-built time-series database with configurable memory and magnetic retention." },
      { id: "B", text: "Amazon DynamoDB with the sensor id as partition key and timestamp as sort key." },
      { id: "C", text: "Amazon Aurora PostgreSQL with a partitioned readings table." },
      { id: "D", text: "Amazon Redshift with hourly loads from S3." }
    ],
    correct: ["A"],
    explanation:
      "The access pattern, the ingest rate and the automatic ageing-out of old data are the defining characteristics of a time-series workload. Timestream handles the ingest, stores recent data in a memory tier and older data in a magnetic tier, and expires data by policy without the team managing capacity.",
    whyWrong: {
      B: "DynamoDB can model this and would work, but capacity management, hot partitions on busy sensors, and hand-rolled TTL and roll-ups make it more operational effort for the same access pattern.",
      C: "A relational engine at 2 million writes per minute requires substantial partition maintenance and vertical scaling, and is not designed for this ingest profile.",
      D: "Redshift is an analytics warehouse loaded in batches; it is not an ingestion target for real-time sensor writes."
    }
  },

  {
    id: "new-004",
    domain: "Design for New Solutions",
    topic: "Event-driven and streaming architectures",
    difficulty: "hard",
    type: "single",
    question:
      "A retailer needs one ordered stream of clickstream events consumed independently by a fraud service, a personalisation service and an analytics pipeline. Consumers must be able to replay the last seven days after a logic change, and each must read at its own pace without affecting the others. Which service should carry the stream?",
    options: [
      { id: "A", text: "Amazon Kinesis Data Streams, with each consumer using enhanced fan-out and its own iterator position." },
      { id: "B", text: "Amazon EventBridge with three rules, one per consumer." },
      { id: "C", text: "Amazon SNS fanning out to three SQS queues." },
      { id: "D", text: "Amazon SQS FIFO with three consumer groups." }
    ],
    correct: ["A"],
    explanation:
      "Kinesis retains records for a configurable window, so any consumer can rewind and replay. Each consumer tracks its own position independently, and enhanced fan-out gives each a dedicated read throughput so a slow consumer cannot starve the others. Ordering is preserved per shard.",
    whyWrong: {
      B: "EventBridge delivers events as they occur and does not retain a replayable log of the last seven days for arbitrary re-processing by consumers.",
      C: "SNS to SQS gives independent consumption but no replay — once a message is consumed and deleted it is gone, and ordering is not preserved on standard queues.",
      D: "SQS has no notion of consumer groups reading the same messages independently; a message consumed by one consumer is not available to the others."
    }
  },

  {
    id: "new-005",
    domain: "Design for New Solutions",
    topic: "Encryption and key management design",
    difficulty: "hard",
    type: "single",
    question:
      "An application replicates encrypted objects between two Regions and must be able to decrypt them in either Region without a call back to the origin Region, while keeping a single logical key whose material the security team controls. What should the architect use?",
    options: [
      { id: "A", text: "A multi-Region KMS key, with a replica key created in the second Region sharing the same key material and key id." },
      { id: "B", text: "Independent single-Region KMS keys in each Region, re-encrypting objects during replication." },
      { id: "C", text: "An AWS managed key in each Region, relying on S3 replication to handle re-encryption." },
      { id: "D", text: "A CloudHSM cluster in the origin Region, accessed cross-Region over a VPC peering connection." }
    ],
    correct: ["A"],
    explanation:
      "Multi-Region keys exist as a primary and replicas that share key material and key id, so ciphertext produced in one Region can be decrypted by the replica in another with no cross-Region call. That is precisely the interoperability this design needs, while the customer still controls the key.",
    whyWrong: {
      B: "This works and is a valid pattern, but it forces a re-encrypt step in the replication path and means two distinct keys to manage rather than one logical key.",
      C: "AWS managed keys cannot be replicated or controlled by the security team, and each Region's key is distinct.",
      D: "Reaching a single HSM cluster cross-Region reintroduces exactly the dependency on the origin Region the requirement removes, and adds latency and a failure mode."
    }
  },

  /* ---------- Continuous Improvement for Existing Solutions (25%) ---------- */

  {
    id: "imp-001",
    domain: "Continuous Improvement for Existing Solutions",
    topic: "Performance bottleneck analysis",
    difficulty: "medium",
    type: "single",
    question:
      "A Lambda-based API backed by Amazon RDS fails under load with database connection errors, even though CPU on the database stays under 40 percent. Concurrency spikes create hundreds of short-lived connections. What is the correct fix?",
    options: [
      { id: "A", text: "Put Amazon RDS Proxy between the functions and the database to pool and reuse connections." },
      { id: "B", text: "Increase the database instance class to raise the connection limit." },
      { id: "C", text: "Add a read replica and send all queries to it." },
      { id: "D", text: "Raise the Lambda function's reserved concurrency so more invocations run in parallel." }
    ],
    correct: ["A"],
    explanation:
      "The symptom — connection exhaustion with low CPU — is a connection-management problem, not a capacity problem. RDS Proxy maintains a warm pool and multiplexes many short-lived client connections onto far fewer database connections, which is the standard remedy for serverless workloads against relational databases.",
    whyWrong: {
      B: "Scaling up raises the connection ceiling at higher cost while leaving the churn of thousands of short-lived connections intact; the ceiling is reached again as traffic grows.",
      C: "A replica helps read scaling, but the failure is connection establishment rather than query throughput, and writes still need the primary.",
      D: "More concurrency creates more simultaneous connections, making the problem worse."
    }
  },

  {
    id: "imp-002",
    domain: "Continuous Improvement for Existing Solutions",
    topic: "Observability strategy",
    difficulty: "medium",
    type: "single",
    question:
      "An organization with 60 accounts needs a single place to search application logs and view operational metrics, without engineers assuming a role in each account to investigate an incident. Which design meets this with the least custom code?",
    options: [
      { id: "A", text: "CloudWatch cross-account observability, linking source accounts to a central monitoring account for logs, metrics and traces." },
      { id: "B", text: "A Lambda function in every account that copies log events into an S3 bucket in a central account each hour." },
      { id: "C", text: "A CloudWatch dashboard in each account, bookmarked by the operations team." },
      { id: "D", text: "An EC2 fleet running a self-managed log aggregator with agents installed in every account." }
    ],
    correct: ["A"],
    explanation:
      "Cross-account observability is the managed feature for exactly this: source accounts are linked to a monitoring account, and engineers then search logs, view metrics and inspect traces from all linked accounts in one console without switching roles.",
    whyWrong: {
      B: "Hourly copying delays incident investigation and creates a pipeline of custom code to own in 60 accounts.",
      C: "Per-account dashboards still require switching accounts during an incident, which is the problem being solved.",
      D: "A self-managed aggregator is the most operational effort of all and duplicates a managed capability."
    }
  },

  {
    id: "imp-003",
    domain: "Continuous Improvement for Existing Solutions",
    topic: "Cost optimization at scale",
    difficulty: "medium",
    type: "single",
    question:
      "A CFO wants an organization-wide programme to reduce compute spend across 60 accounts: identify over-provisioned instances, commit to a discount that survives instance family changes, and give each business unit visibility of its own spend. Which combination should the architect propose?",
    options: [
      { id: "A", text: "AWS Compute Optimizer for right-sizing recommendations, Compute Savings Plans for the steady baseline, and cost allocation tags with per-unit budgets in the management account." },
      { id: "B", text: "Standard Reserved Instances for all steady workloads, with Trusted Advisor checks reviewed quarterly." },
      { id: "C", text: "Spot Instances for all workloads, with capacity rebalancing enabled." },
      { id: "D", text: "Consolidated billing alone, letting volume discounts accrue automatically." }
    ],
    correct: ["A"],
    explanation:
      "Each requirement maps to one mechanism: Compute Optimizer produces right-sizing recommendations with projected savings across the organization, Compute Savings Plans give a deep discount that remains flexible across instance family, size and Region, and cost allocation tags with Budgets give business units their own view and alerts.",
    whyWrong: {
      B: "Standard RIs lock to an instance family, which conflicts with surviving family changes, and quarterly manual review is not a programme.",
      C: "Spot suits interruption-tolerant work only; applying it to all workloads would break the ones that cannot tolerate reclamation.",
      D: "Consolidated billing aggregates spend but neither reduces it nor attributes it to business units."
    }
  },

  {
    id: "imp-004",
    domain: "Continuous Improvement for Existing Solutions",
    topic: "Reliability improvements and fault isolation",
    difficulty: "hard",
    type: "single",
    question:
      "A multi-tenant SaaS suffers occasional incidents where one tenant's traffic surge degrades the service for every tenant. The company wants to bound the impact of any single tenant without running separate infrastructure per tenant. Which approach best achieves this?",
    options: [
      { id: "A", text: "Partition tenants into a number of independent cells, each a full stack serving a subset of tenants, and route each tenant to its assigned cell." },
      { id: "B", text: "Increase the size of the shared Auto Scaling group so it absorbs any tenant's surge." },
      { id: "C", text: "Add a CloudFront distribution in front of the shared stack." },
      { id: "D", text: "Move the shared database to a larger instance class with more connections." }
    ],
    correct: ["A"],
    explanation:
      "Cell-based architecture bounds blast radius: a tenant's surge can only exhaust the cell it is assigned to, so an incident affects that fraction of tenants rather than all of them. It gives isolation without dedicating a stack to each tenant, since many tenants share a cell.",
    whyWrong: {
      B: "A bigger shared pool is still shared — one tenant can consume it, and the failure mode is unchanged at a higher cost.",
      C: "Caching helps read-heavy static content but does nothing to isolate tenants competing for backend capacity.",
      D: "Scaling the database up raises limits without isolating tenants from one another."
    }
  },

  /* ---------- Accelerate Workload Migration and Modernization (20%) ---------- */

  {
    id: "mig-001",
    domain: "Accelerate Workload Migration and Modernization",
    topic: "Migration strategy selection",
    difficulty: "medium",
    type: "single",
    question:
      "A company must vacate its data centre in six months. Of 300 applications, most are commodity workloads on supported operating systems, a handful are commercial products the vendor now offers as SaaS, and about 20 are legacy applications nobody uses. Which strategy mix reflects the right priorities?",
    options: [
      { id: "A", text: "Rehost the bulk of the estate, repurchase the vendor products as SaaS, retire the unused applications, and defer refactoring until after the deadline." },
      { id: "B", text: "Refactor every application to serverless before migrating, to avoid carrying technical debt into AWS." },
      { id: "C", text: "Retain the estate on-premises and extend the data centre lease while a full modernisation programme runs." },
      { id: "D", text: "Replatform all 300 applications onto managed services during the move." }
    ],
    correct: ["A"],
    explanation:
      "With a hard deadline, the strategies are chosen per application. Rehosting is the fastest route for commodity workloads, repurchasing removes applications entirely where the vendor offers SaaS, and retiring unused applications reduces scope for free. Refactoring is the slowest strategy and is deferred until the deadline is met.",
    whyWrong: {
      B: "Refactoring 300 applications is a multi-year programme and guarantees missing a six-month deadline.",
      C: "Extending the lease contradicts the stated constraint that the data centre must be vacated.",
      D: "Replatforming everything adds change and testing to every workload, which the deadline does not allow, and many commodity workloads gain little from it."
    }
  },

  {
    id: "mig-002",
    domain: "Accelerate Workload Migration and Modernization",
    topic: "Database migration with DMS and SCT",
    difficulty: "medium",
    type: "single",
    question:
      "A 4 TB Oracle database must move to Amazon Aurora PostgreSQL with no more than 15 minutes of downtime at cutover. Stored procedures and schema objects must be converted. Which approach should the architect use?",
    options: [
      { id: "A", text: "Convert the schema with AWS Schema Conversion Tool, then run AWS DMS with full load plus change data capture, cutting over once replication lag is near zero." },
      { id: "B", text: "Export with Data Pump, copy the dump to S3, and import into Aurora during a weekend outage." },
      { id: "C", text: "Create an Aurora read replica of the Oracle database and promote it at cutover." },
      { id: "D", text: "Use AWS DataSync to copy the database files into Aurora's storage layer." }
    ],
    correct: ["A"],
    explanation:
      "This is a heterogeneous migration, so the schema and procedural code need conversion first — the job SCT does. DMS then performs a full load followed by continuous change data capture, so the target stays current while the source keeps serving; cutover happens when lag approaches zero, which is what keeps downtime inside 15 minutes.",
    whyWrong: {
      B: "A dump and import means the source is frozen for the whole transfer and load of 4 TB, far exceeding 15 minutes, and Data Pump does not convert Oracle procedures to PostgreSQL.",
      C: "Read replicas exist within an engine family; Aurora PostgreSQL cannot be a replica of an Oracle database.",
      D: "DataSync moves files between file and object storage. Database storage internals are not accessible or portable this way."
    }
  },

  {
    id: "mig-003",
    domain: "Accelerate Workload Migration and Modernization",
    topic: "Large-scale data transfer",
    difficulty: "medium",
    type: "single",
    question:
      "A broadcaster must move a 900 TB archive to Amazon S3 within eight weeks, and afterwards keep synchronising roughly 2 TB of new footage each week from the same on-premises NAS. The site has a 1 Gbps link shared with production traffic. What should the architect propose?",
    options: [
      { id: "A", text: "Move the 900 TB archive with AWS Snowball Edge devices, then use AWS DataSync over the network for the weekly 2 TB increments." },
      { id: "B", text: "Use AWS DataSync for both the initial archive and the weekly increments." },
      { id: "C", text: "Use Snowball Edge for the archive and ship a further device every week for the increments." },
      { id: "D", text: "Use S3 Transfer Acceleration with multipart uploads for both the archive and the increments." }
    ],
    correct: ["A"],
    explanation:
      "The two workloads have different shapes. 900 TB over a shared 1 Gbps link would take many months, so the bulk archive goes offline via Snowball Edge. The ongoing 2 TB per week is a few hours of transfer, well within the link's capacity, and DataSync handles scheduled incremental synchronisation with verification.",
    whyWrong: {
      B: "DataSync cannot overcome physics — 900 TB on a shared 1 Gbps link misses the eight-week deadline by a wide margin.",
      C: "Shipping a device weekly for 2 TB adds handling delay and cost for a volume the network transfers comfortably.",
      D: "Transfer Acceleration optimises long-distance throughput but is still bounded by the site's own uplink, so the archive remains infeasible."
    }
  }

];
