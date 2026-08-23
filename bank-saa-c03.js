/*
 * SAA-C03 — Solutions Architect Associate question bank
 *
 * Every entry MUST use one of these four exact domain strings:
 *   "Design Secure Architectures"
 *   "Design Resilient Architectures"
 *   "Design High-Performing Architectures"
 *   "Design Cost-Optimized Architectures"
 *
 * Keep `topic` labels consistent across questions covering the same concept —
 * the adaptive engine tracks accuracy per "domain :: topic".
 *
 * Schema:
 *   { id, domain, topic, difficulty, type, question, options[{id,text}],
 *     correct[], explanation, whyWrong{} }
 *
 * All questions are original scenarios written for this trainer.
 */

window.BANKS = window.BANKS || {};
window.BANKS["SAA-C03"] = [

  /* ==========================================================
   * Design Secure Architectures  (exam weight 30%)
   * ========================================================== */

  {
    id: "sec-001",
    domain: "Design Secure Architectures",
    topic: "IAM policy evaluation",
    difficulty: "medium",
    type: "single",
    question:
      "A logistics company attaches an IAM identity-based policy to a developer group that explicitly allows s3:GetObject on arn:aws:s3:::freight-reports/*. The account is in an AWS Organizations OU whose SCP allows all S3 actions. The freight-reports bucket policy contains an explicit Deny for s3:GetObject when aws:SourceVpce does not match the account's VPC endpoint. A developer working from a corporate laptop over the public internet calls GetObject on an object in that bucket. What happens?",
    options: [
      { id: "A", text: "The request succeeds, because the identity-based policy explicitly allows the action and identity policies take precedence over resource policies." },
      { id: "B", text: "The request is denied, because an explicit Deny in any applicable policy overrides every Allow." },
      { id: "C", text: "The request succeeds, because the SCP allows all S3 actions and SCPs are evaluated last." },
      { id: "D", text: "The request is denied, but only if the developer's group also lacks s3:ListBucket permission." }
    ],
    correct: ["B"],
    explanation:
      "IAM evaluation logic is fixed: an explicit Deny anywhere in the evaluated policy set always wins, then an explicit Allow, and anything not allowed is an implicit deny. The bucket policy's Deny is conditioned on aws:SourceVpce, and a request over the public internet carries no VPC endpoint key, so the condition matches and the Deny applies. Neither the identity policy nor the SCP can override it.",
    whyWrong: {
      A: "Identity-based policies do not take precedence over resource-based policies. Both are evaluated together, and a Deny in either one is decisive.",
      C: "SCPs never grant permissions — they only set the maximum available permissions. An SCP that allows all S3 actions cannot override a bucket policy Deny.",
      D: "ListBucket is a separate bucket-level action and has no bearing on whether the GetObject Deny applies."
    }
  },

  {
    id: "sec-002",
    domain: "Design Secure Architectures",
    topic: "Cross-account access with IAM roles",
    difficulty: "medium",
    type: "single",
    question:
      "A media analytics firm runs its data platform in account B and needs a batch job running on EC2 in account A to read objects from an S3 bucket in account B. Security requires that no long-lived credentials exist anywhere in account A, and that account B retains the ability to revoke access unilaterally. Which approach meets these requirements?",
    options: [
      { id: "A", text: "Create an IAM user in account B with S3 read permissions and store its access keys in AWS Secrets Manager in account A." },
      { id: "B", text: "Create an IAM role in account B whose trust policy trusts the EC2 instance role in account A, and have the batch job call sts:AssumeRole." },
      { id: "C", text: "Make the bucket in account B public and restrict access using a bucket policy condition on the account A VPC CIDR." },
      { id: "D", text: "Enable S3 Cross-Region Replication from account B into a bucket in account A and read the replica locally." }
    ],
    correct: ["B"],
    explanation:
      "The standard cross-account pattern is a role in the resource-owning account (B) with a trust policy naming the principal in account A, assumed via STS. Credentials are temporary, nothing long-lived lands in account A, and account B can revoke access at any time by editing the trust policy or the role's permissions.",
    whyWrong: {
      A: "This creates long-lived access keys, which the requirement explicitly forbids. Storing them in Secrets Manager protects them but does not eliminate them.",
      C: "Making a bucket public is a serious exposure, and a VPC CIDR condition is meaningless for traffic arriving over the internet since private CIDRs are not preserved as the source.",
      D: "Replication copies the data rather than granting access, doubling storage cost, adding lag, and handing account A a copy that account B can no longer revoke."
    }
  },

  {
    id: "sec-003",
    domain: "Design Secure Architectures",
    topic: "S3 encryption options",
    difficulty: "medium",
    type: "single",
    question:
      "A healthcare records platform must store documents in S3 under an audit rule requiring that every decryption event be attributable to a named principal in AWS CloudTrail, and that the security team be able to disable all decryption of the archive within minutes during an incident. Which encryption configuration satisfies both requirements with the least operational effort?",
    options: [
      { id: "A", text: "SSE-S3 with S3 server access logging enabled on the bucket." },
      { id: "B", text: "SSE-KMS using a customer managed key, with CloudTrail logging KMS Decrypt calls." },
      { id: "C", text: "SSE-C, with the application supplying the key on every request." },
      { id: "D", text: "Client-side encryption with keys held in an on-premises HSM." }
    ],
    correct: ["B"],
    explanation:
      "SSE-KMS with a customer managed key records each Decrypt call in CloudTrail with the calling principal, satisfying attribution. Because the key is customer managed, the security team can disable the key (or revoke grants) to stop all decryption almost immediately — a control that AWS managed keys and SSE-S3 do not provide.",
    whyWrong: {
      A: "SSE-S3 keys are managed entirely by AWS with no per-decryption CloudTrail attribution and no customer-controlled kill switch.",
      C: "SSE-C requires the application to supply and manage the key material on every request; AWS never logs a KMS event for it and there is no central way to disable decryption.",
      D: "Client-side encryption with an on-premises HSM can meet the control requirement but adds substantial operational effort and gives no CloudTrail record of decryption, which happens outside AWS."
    }
  },

  {
    id: "sec-004",
    domain: "Design Secure Architectures",
    topic: "Security groups vs NACLs",
    difficulty: "easy",
    type: "multi",
    question:
      "An architect is documenting the differences between security groups and network ACLs for a new VPC design. Which TWO statements are correct?",
    options: [
      { id: "A", text: "Security groups are stateful: return traffic for an allowed inbound flow is automatically permitted outbound." },
      { id: "B", text: "Network ACLs are stateful and evaluate rules in numerical order until a match is found." },
      { id: "C", text: "Network ACLs support explicit deny rules; security groups support allow rules only." },
      { id: "D", text: "Security groups are attached to subnets, while network ACLs are attached to elastic network interfaces." },
      { id: "E", text: "Security group rules are evaluated in numbered order, and the first match wins." }
    ],
    correct: ["A", "C"],
    explanation:
      "Security groups are stateful and contain only allow rules — all rules are evaluated together and there is no ordering. Network ACLs are stateless, apply at the subnet boundary, are evaluated in rule-number order, and support both allow and deny rules, which is why they are the tool for blocking a specific IP.",
    whyWrong: {
      B: "Network ACLs are stateless, not stateful. Return traffic must be permitted by an explicit outbound rule (typically on ephemeral ports).",
      D: "This is reversed: security groups attach to ENIs, network ACLs attach to subnets.",
      E: "Security group rules are not ordered or numbered; the whole rule set is evaluated as a union of allows."
    }
  },

  {
    id: "sec-005",
    domain: "Design Secure Architectures",
    topic: "Secrets management and rotation",
    difficulty: "medium",
    type: "single",
    question:
      "A payments team stores an Amazon RDS for PostgreSQL master password as a SecureString in Systems Manager Parameter Store. A new compliance rule requires the credential to be rotated automatically every 30 days without application downtime or custom scheduling code. What should the team do?",
    options: [
      { id: "A", text: "Keep the parameter and create an EventBridge rule that triggers a custom Lambda function to change the password every 30 days." },
      { id: "B", text: "Move the credential to AWS Secrets Manager and enable managed rotation with the built-in RDS rotation configuration." },
      { id: "C", text: "Enable Parameter Store advanced parameters, which adds native 30-day credential rotation." },
      { id: "D", text: "Store the password in an encrypted S3 object and use an S3 Lifecycle rule to expire and regenerate it every 30 days." }
    ],
    correct: ["B"],
    explanation:
      "Secrets Manager provides managed rotation for supported databases including RDS: it deploys and schedules the rotation logic for you, updates the secret, and applications retrieving the current version continue working. This meets the requirement without custom scheduling code.",
    whyWrong: {
      A: "This works technically but is exactly the custom scheduling and rotation code the requirement rules out, and the team owns the failure modes.",
      C: "Advanced parameters raise size and throughput limits and add policies such as expiration notification, but Parameter Store has no built-in credential rotation.",
      D: "Lifecycle rules expire objects; they cannot generate or rotate credentials, and an S3 object is not a credential store."
    }
  },

  {
    id: "sec-006",
    domain: "Design Secure Architectures",
    topic: "VPC endpoints and private connectivity",
    difficulty: "medium",
    type: "single",
    question:
      "An insurance company runs an application on EC2 instances in private subnets. The instances currently reach Amazon S3 and Amazon DynamoDB through a NAT gateway. Security now requires that this traffic never traverse the public internet, and finance wants the associated NAT data-processing charges eliminated. Which change meets both goals?",
    options: [
      { id: "A", text: "Create gateway VPC endpoints for S3 and DynamoDB and add the endpoints to the private subnets' route tables." },
      { id: "B", text: "Create interface VPC endpoints for S3 and DynamoDB and keep the NAT gateway for failover." },
      { id: "C", text: "Move the instances to public subnets with Elastic IPs so traffic goes directly to the AWS service endpoints." },
      { id: "D", text: "Configure an AWS Site-to-Site VPN between the VPC and the S3 and DynamoDB service endpoints." }
    ],
    correct: ["A"],
    explanation:
      "S3 and DynamoDB are the two services supported by gateway VPC endpoints. A gateway endpoint adds a route table prefix-list entry so traffic to those services stays on the AWS network, and gateway endpoints carry no hourly or per-GB charge — removing both the internet path and the NAT processing cost.",
    whyWrong: {
      B: "An interface endpoint for S3 is possible but bills hourly plus per-GB, and DynamoDB is reached via gateway endpoints; keeping the NAT gateway also preserves the cost the requirement asks to eliminate.",
      C: "Public subnets with Elastic IPs send the traffic over the public internet, which is precisely what the security requirement forbids.",
      D: "Site-to-Site VPN connects a VPC to on-premises networks. You cannot terminate a VPN on an AWS service endpoint."
    }
  },

  {
    id: "sec-007",
    domain: "Design Secure Architectures",
    topic: "Edge protection with WAF and Shield",
    difficulty: "medium",
    type: "single",
    question:
      "A retail site fronted by Application Load Balancer and Amazon CloudFront is being hit by two problems at once: a volumetric UDP and SYN flood against the edge, and application-layer requests attempting SQL injection against the checkout API. The company wants layered protection with a 24/7 response team available during attacks. Which combination should the architect deploy?",
    options: [
      { id: "A", text: "AWS WAF with the SQL database managed rule group only, since WAF inspects all packet types." },
      { id: "B", text: "AWS Shield Advanced for the network and transport layer flood, plus AWS WAF with a SQL injection rule group for the application layer." },
      { id: "C", text: "Network ACLs denying the attacking source ranges, plus Amazon GuardDuty for the injection attempts." },
      { id: "D", text: "Amazon Inspector on the ALB, plus Shield Standard, which includes the AWS Shield Response Team." }
    ],
    correct: ["B"],
    explanation:
      "The two attacks sit at different layers. Shield (Advanced) addresses layers 3 and 4 volumetric floods and includes access to the AWS Shield Response Team plus cost protection. AWS WAF operates at layer 7 and its managed SQL database rule group blocks injection attempts. Together they provide the layered defence described.",
    whyWrong: {
      A: "WAF inspects HTTP/HTTPS requests only; it cannot mitigate a UDP or SYN flood, and it has no 24/7 response team.",
      C: "NACLs cannot keep up with a distributed volumetric flood, and GuardDuty is a detection service — it does not block SQL injection.",
      D: "Inspector scans workloads for vulnerabilities rather than filtering traffic, and Shield Standard is automatic and free but does not include Shield Response Team access."
    }
  },

  {
    id: "sec-008",
    domain: "Design Secure Architectures",
    topic: "KMS key policies and grants",
    difficulty: "hard",
    type: "single",
    question:
      "A data science account (account D) must decrypt objects in an S3 bucket owned by a platform account (account P). The objects are encrypted with a customer managed KMS key in account P. The bucket policy already grants account D s3:GetObject, and account D's role has an identity policy allowing both s3:GetObject and kms:Decrypt on the key ARN. Requests still fail with an access denied error from KMS. What is the most likely cause?",
    options: [
      { id: "A", text: "The KMS key policy in account P does not grant account D permission to use the key." },
      { id: "B", text: "KMS keys cannot be used across accounts; the data must be re-encrypted with a key in account D." },
      { id: "C", text: "The S3 bucket is missing a Requester Pays configuration." },
      { id: "D", text: "The role in account D must be in the same Region as the S3 bucket for KMS to resolve the key." }
    ],
    correct: ["A"],
    explanation:
      "KMS access is governed by the key policy first. For cross-account use, the key policy in the owning account must grant the external account (or principal) permission, and the external account must then delegate that permission to its principals via IAM. Having only the IAM side configured is the classic cause of an access denied from KMS.",
    whyWrong: {
      B: "KMS keys explicitly support cross-account use through key policies and grants; re-encryption is unnecessary.",
      C: "Requester Pays governs who is billed for data transfer and requests, not whether a KMS decrypt is authorised.",
      D: "KMS keys are regional and the key must be in the bucket's Region, but the calling principal's account has no Region, so this does not explain the denial."
    }
  },

  /* ==========================================================
   * Design Resilient Architectures  (exam weight 26%)
   * ========================================================== */

  {
    id: "res-001",
    domain: "Design Resilient Architectures",
    topic: "RDS Multi-AZ vs read replicas",
    difficulty: "easy",
    type: "single",
    question:
      "A reporting application runs on Amazon RDS for MySQL. The business has two separate complaints: overnight analytical queries slow down the transactional workload, and an AZ outage last quarter caused a four-hour outage. Which combination of RDS features addresses both complaints?",
    options: [
      { id: "A", text: "Deploy Multi-AZ for automatic failover and add one or more read replicas to serve the analytical queries." },
      { id: "B", text: "Deploy two read replicas and promote one manually if the primary AZ fails." },
      { id: "C", text: "Enable Multi-AZ and direct the analytical queries to the standby instance." },
      { id: "D", text: "Increase the instance size and enable automated backups with a five-minute retention window." }
    ],
    correct: ["A"],
    explanation:
      "The two problems need two different features. Multi-AZ maintains a synchronous standby in another AZ and fails over automatically, addressing availability. Read replicas are asynchronous copies that can serve read traffic, offloading the analytical queries from the primary.",
    whyWrong: {
      B: "Read replicas are for read scaling; promoting one is a manual, lossy process that does not deliver automatic failover.",
      C: "In a classic RDS Multi-AZ deployment the standby is not readable. Only a Multi-AZ DB cluster deployment offers readable standbys.",
      D: "A larger instance may mask the contention temporarily and backups aid recovery, but neither provides automatic AZ failover or read offloading."
    }
  },

  {
    id: "res-002",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "medium",
    type: "single",
    question:
      "An order-processing tier writes directly to a fleet of worker EC2 instances over HTTP. During flash sales the workers are overwhelmed and orders are lost, and when a worker crashes mid-request the order disappears. The company wants to guarantee that no order is lost and that the workers can process at their own rate. What should the architect implement?",
    options: [
      { id: "A", text: "Place an Application Load Balancer in front of the workers and enable connection draining." },
      { id: "B", text: "Publish each order to an Amazon SQS queue, have workers poll the queue, and configure a dead-letter queue with an appropriate visibility timeout." },
      { id: "C", text: "Increase the worker instance size and enable detailed CloudWatch monitoring at one-minute granularity." },
      { id: "D", text: "Write each order to an Amazon SNS topic and subscribe the workers' HTTP endpoints." }
    ],
    correct: ["B"],
    explanation:
      "A queue decouples producers from consumers: bursts accumulate in SQS instead of being dropped, and workers consume at their own pace. Because a message becomes visible again if it is not deleted before the visibility timeout expires, a crashed worker's message is redelivered rather than lost, and a dead-letter queue captures messages that repeatedly fail.",
    whyWrong: {
      A: "A load balancer distributes requests but provides no buffering. If all workers are saturated the requests still fail, and an in-flight request is still lost when the instance dies.",
      C: "Vertical scaling raises the ceiling but does not absorb bursts or protect in-flight work, and monitoring only observes the loss.",
      D: "SNS is push-based fan-out with no durable buffer for slow consumers; if the HTTP endpoints are overwhelmed, delivery ultimately fails."
    }
  },

  {
    id: "res-003",
    domain: "Design Resilient Architectures",
    topic: "Route 53 routing policies",
    difficulty: "medium",
    type: "single",
    question:
      "A SaaS provider runs an identical stack in eu-west-1 and us-east-1. Users must be sent to whichever Region responds fastest for them, and if a Region's stack becomes unhealthy all of its traffic must move to the other Region automatically. Which Route 53 configuration meets this requirement?",
    options: [
      { id: "A", text: "Weighted routing with equal weights and TTL set to 60 seconds." },
      { id: "B", text: "Latency-based routing records for both Regions, each associated with a Route 53 health check." },
      { id: "C", text: "Geolocation routing based on the user's continent, with a default record for unmatched locations." },
      { id: "D", text: "Simple routing with two IP addresses in a single record set." }
    ],
    correct: ["B"],
    explanation:
      "Latency-based routing returns the endpoint with the lowest measured network latency for the requesting resolver, which is what 'fastest for them' means. Attaching health checks to each record makes Route 53 stop returning an unhealthy Region, so its traffic shifts automatically to the surviving Region.",
    whyWrong: {
      A: "Weighted routing splits traffic by a fixed ratio and is blind to latency; it is for canaries and gradual migrations.",
      C: "Geolocation routes by where the user is, not by which endpoint is fastest — the nearest Region geographically is not always the lowest latency.",
      D: "Simple routing returns all values in random order with no health checking and no latency awareness."
    }
  },

  {
    id: "res-004",
    domain: "Design Resilient Architectures",
    topic: "Disaster recovery strategies",
    difficulty: "hard",
    type: "single",
    question:
      "A trading platform sets an RTO of 10 minutes and an RPO of 1 minute for its regional failover. The business rejects running a second full-capacity Region because of cost, but accepts running a scaled-down version of the environment continuously. Which disaster recovery strategy matches these constraints?",
    options: [
      { id: "A", text: "Backup and restore using nightly snapshots copied to the secondary Region." },
      { id: "B", text: "Pilot light, with only the database replicated and all application servers switched off." },
      { id: "C", text: "Warm standby, running a reduced-capacity but always-live copy of the stack with continuous data replication, scaled up on failover." },
      { id: "D", text: "Multi-site active/active with both Regions serving production traffic at full capacity." }
    ],
    correct: ["C"],
    explanation:
      "Warm standby keeps a functional, scaled-down copy of the entire stack running with continuous replication. Failover means redirecting traffic and scaling out, which fits a 10-minute RTO, while continuous replication supports a 1-minute RPO — and it costs far less than a full second Region.",
    whyWrong: {
      A: "Nightly snapshots give an RPO measured in hours and a restore-driven RTO measured in hours; both miss the targets by orders of magnitude.",
      B: "Pilot light replicates data but leaves the application tier off, so recovery requires provisioning and starting the stack — typically too slow for a 10-minute RTO, and it does not match 'a scaled-down version running'.",
      D: "Active/active would meet the targets but is exactly the full-capacity second Region the business rejected on cost."
    }
  },

  {
    id: "res-005",
    domain: "Design Resilient Architectures",
    topic: "Auto Scaling and health checks",
    difficulty: "medium",
    type: "single",
    question:
      "EC2 instances in an Auto Scaling group behind an Application Load Balancer occasionally enter a state where the operating system is running but the application process has died. The ALB marks them unhealthy and stops sending traffic, yet Auto Scaling leaves them in service indefinitely. What is the correct fix?",
    options: [
      { id: "A", text: "Change the Auto Scaling group's health check type to ELB so it acts on the load balancer's health status." },
      { id: "B", text: "Shorten the ALB health check interval so failures are detected sooner." },
      { id: "C", text: "Enable termination protection on the instances so they can be investigated." },
      { id: "D", text: "Attach a scaling policy based on CPU utilisation so dead instances are replaced when CPU drops." }
    ],
    correct: ["A"],
    explanation:
      "By default an Auto Scaling group uses EC2 status checks, which only verify the instance and its hypervisor — a dead application process still passes. Setting the health check type to ELB makes the group treat the load balancer's application-level health check as authoritative, so it terminates and replaces the failing instance.",
    whyWrong: {
      B: "Faster detection by the ALB changes nothing if Auto Scaling is not consulting the ALB's verdict.",
      C: "Termination protection actively prevents the replacement the architecture needs.",
      D: "A CPU-based policy adjusts capacity; it does not identify or replace a specific unhealthy instance, and an idle dead instance can even suppress scale-out by lowering average CPU."
    }
  },

  {
    id: "res-006",
    domain: "Design Resilient Architectures",
    topic: "S3 durability and replication",
    difficulty: "medium",
    type: "multi",
    question:
      "A compliance team requires that objects in a production S3 bucket be copied automatically to a bucket in a second Region, and that an accidental overwrite can be undone. Which TWO configurations are required?",
    options: [
      { id: "A", text: "Enable versioning on both the source and destination buckets." },
      { id: "B", text: "Configure S3 Cross-Region Replication with an IAM role that S3 can assume to read the source and write the destination." },
      { id: "C", text: "Enable S3 Transfer Acceleration on the source bucket." },
      { id: "D", text: "Enable requester-pays on the destination bucket." },
      { id: "E", text: "Configure a Lifecycle rule to transition objects to S3 Glacier Flexible Retrieval after one day." }
    ],
    correct: ["A", "B"],
    explanation:
      "S3 replication requires versioning on both source and destination buckets, and a replication rule with an IAM role that S3 assumes to read source objects and write them to the destination. Versioning also satisfies the second requirement: a previous version can be restored after an accidental overwrite.",
    whyWrong: {
      C: "Transfer Acceleration speeds long-distance uploads from clients via edge locations; it has nothing to do with replication.",
      D: "Requester Pays shifts data-transfer billing to the requester and does not affect replication.",
      E: "A lifecycle transition changes storage class; it neither replicates data nor helps recover an overwritten object."
    }
  },

  {
    id: "res-007",
    domain: "Design Resilient Architectures",
    topic: "Aurora high availability",
    difficulty: "medium",
    type: "single",
    question:
      "A subscription service runs Amazon Aurora MySQL with a single writer and no replicas. During a recent AZ impairment the database was unavailable for several minutes while AWS recovered the writer. The team wants the fastest possible automatic recovery from a writer failure and also wants to scale read traffic. What should they do?",
    options: [
      { id: "A", text: "Add at least one Aurora Replica in a different Availability Zone and set failover priority tiers." },
      { id: "B", text: "Enable Multi-AZ on the Aurora cluster from the RDS console, which creates a synchronous standby." },
      { id: "C", text: "Take more frequent automated snapshots and restore from the latest snapshot on failure." },
      { id: "D", text: "Enable Aurora Serverless v2 scaling so capacity is added automatically during a failure." }
    ],
    correct: ["A"],
    explanation:
      "Aurora fails over fastest when there is an existing replica to promote — promotion is typically well under a minute, versus a slower recreate when the cluster has no replicas. Replicas simultaneously serve read traffic via the cluster reader endpoint, so a single change addresses both goals. Failover tiers let you control which replica is promoted first.",
    whyWrong: {
      B: "Aurora's storage is already replicated across three AZs and there is no separate Multi-AZ toggle as in RDS; high availability comes from adding replicas.",
      C: "Snapshot restore is a recovery-of-last-resort measured in tens of minutes or more and loses data since the last snapshot.",
      D: "Serverless v2 adjusts capacity for load. It does not create a second instance to promote, and it does not add read scaling on its own."
    }
  },

  {
    id: "res-008",
    domain: "Design Resilient Architectures",
    topic: "Stateless application design",
    difficulty: "medium",
    type: "single",
    question:
      "A web application stores user session data in memory on each EC2 instance behind an Application Load Balancer. Users are logged out whenever an instance is replaced by Auto Scaling, and enabling sticky sessions has caused uneven load. The team wants session data to survive instance replacement with single-digit-millisecond reads. Which change should they make?",
    options: [
      { id: "A", text: "Store sessions in Amazon ElastiCache for Redis and make the instances stateless." },
      { id: "B", text: "Store sessions in an Amazon EFS file system mounted by all instances." },
      { id: "C", text: "Increase the sticky session cookie duration to 24 hours." },
      { id: "D", text: "Store sessions in Amazon S3 using one object per session." }
    ],
    correct: ["A"],
    explanation:
      "Externalising session state to a shared in-memory store makes the instances stateless, so any instance can serve any request and instance replacement is invisible to users. ElastiCache for Redis delivers the sub-millisecond to single-digit-millisecond latency a session lookup on every request demands.",
    whyWrong: {
      B: "EFS is a shared file system with far higher per-operation latency than an in-memory store, and file-based session locking scales poorly.",
      C: "Longer stickiness deepens the load imbalance already reported and still loses sessions when the pinned instance is replaced.",
      D: "S3 is durable but its request latency is tens of milliseconds and it is not designed for the read-and-write-per-request pattern of session state."
    }
  },

  /* ==========================================================
   * Design High-Performing Architectures  (exam weight 24%)
   * ========================================================== */

  {
    id: "perf-001",
    domain: "Design High-Performing Architectures",
    topic: "EBS volume type selection",
    difficulty: "medium",
    type: "single",
    question:
      "A self-managed PostgreSQL instance on EC2 uses a 500 GiB gp2 volume and is saturating IOPS during month-end processing. The team measures a sustained requirement of 12,000 IOPS and 400 MB/s throughput, and wants the lowest-cost EBS volume that meets it without over-provisioning capacity. Which volume type should they choose?",
    options: [
      { id: "A", text: "Grow the gp2 volume to 4 TiB so it reaches the required baseline IOPS." },
      { id: "B", text: "Use a gp3 volume and provision 12,000 IOPS and 400 MB/s independently of the 500 GiB size." },
      { id: "C", text: "Use an st1 throughput-optimised HDD volume sized at 500 GiB." },
      { id: "D", text: "Use two 500 GiB gp2 volumes in a RAID 0 stripe." }
    ],
    correct: ["B"],
    explanation:
      "gp3 decouples performance from capacity: it starts at 3,000 IOPS and 125 MB/s and lets you provision up to 16,000 IOPS and 1,000 MB/s regardless of volume size. Provisioning exactly 12,000 IOPS and 400 MB/s on a 500 GiB gp3 volume meets the requirement without paying for unnecessary capacity, and gp3 is cheaper per GiB than gp2.",
    whyWrong: {
      A: "gp2 ties IOPS to size at 3 IOPS/GiB, so reaching 12,000 IOPS means paying for 4 TiB of unneeded capacity — the definition of over-provisioning.",
      C: "st1 is a throughput-oriented HDD designed for large sequential workloads. Its IOPS characteristics are unsuitable for a transactional database.",
      D: "RAID 0 across gp2 volumes doubles both cost and failure surface and is operationally complex compared with simply provisioning gp3 performance."
    }
  },

  {
    id: "perf-002",
    domain: "Design High-Performing Architectures",
    topic: "DynamoDB performance and caching",
    difficulty: "medium",
    type: "single",
    question:
      "A gaming leaderboard on DynamoDB serves a read-heavy workload where the same few hundred items are requested constantly. Read capacity costs are climbing and the team needs to cut read latency from single-digit milliseconds to microseconds with no application rewrite beyond changing the client endpoint. What should they implement?",
    options: [
      { id: "A", text: "Amazon DynamoDB Accelerator (DAX) in front of the table." },
      { id: "B", text: "Amazon ElastiCache for Memcached with cache-aside logic in the application." },
      { id: "C", text: "A global secondary index on the leaderboard sort key." },
      { id: "D", text: "Switch the table to on-demand capacity mode." }
    ],
    correct: ["A"],
    explanation:
      "DAX is a write-through, DynamoDB-API-compatible in-memory cache that delivers microsecond reads for cached items and reduces read capacity consumption on the table. Because it is API-compatible, adopting it is largely a matter of pointing the DynamoDB client at the DAX cluster endpoint.",
    whyWrong: {
      B: "Memcached would work but requires writing and maintaining cache-aside logic, invalidation, and serialisation — more than the endpoint change described.",
      C: "A GSI creates an alternative access pattern; it does not cache and it adds cost, since the index consumes its own capacity.",
      D: "On-demand changes the billing model and can raise costs for steady heavy traffic; it does nothing for latency."
    }
  },

  {
    id: "perf-003",
    domain: "Design High-Performing Architectures",
    topic: "CloudFront and content delivery",
    difficulty: "easy",
    type: "single",
    question:
      "A media company serves large video files from an S3 bucket in eu-central-1. Viewers in South America and Asia report slow start times, and S3 data-transfer-out charges are high. The company wants to improve playback start time globally and reduce origin egress. What should the architect do?",
    options: [
      { id: "A", text: "Create a CloudFront distribution with the S3 bucket as the origin, using an origin access control." },
      { id: "B", text: "Enable S3 Transfer Acceleration on the bucket." },
      { id: "C", text: "Replicate the bucket to Regions in South America and Asia and ask viewers to choose the nearest URL." },
      { id: "D", text: "Place an Application Load Balancer in front of the S3 bucket in each Region." }
    ],
    correct: ["A"],
    explanation:
      "CloudFront caches objects at edge locations close to viewers, cutting start-up latency worldwide, and cached hits are served from the edge rather than the origin, which reduces S3 data transfer out. Origin access control keeps the bucket private so content is only reachable through the distribution.",
    whyWrong: {
      B: "Transfer Acceleration optimises uploads into S3 over long distances; it is not a download caching layer and does not reduce origin egress for viewers.",
      C: "Cross-Region Replication multiplies storage cost and pushes Region selection onto users, which is both worse for them and unnecessary when a CDN solves it transparently.",
      D: "An ALB cannot use an S3 bucket as a target, and load balancing does not address geographic latency or caching."
    }
  },

  {
    id: "perf-004",
    domain: "Design High-Performing Architectures",
    topic: "Streaming ingestion with Kinesis",
    difficulty: "hard",
    type: "single",
    question:
      "An IoT platform ingests telemetry from 200,000 sensors. Requirements: records from a given sensor must be processed in the order they were produced, three independent teams must each consume the full stream for different purposes, and any consumer must be able to reprocess the last seven days of data after a bug fix. Which service best meets all three requirements?",
    options: [
      { id: "A", text: "Amazon SQS standard queues, one per consuming team." },
      { id: "B", text: "Amazon Kinesis Data Streams with the sensor ID as the partition key and a seven-day retention period." },
      { id: "C", text: "Amazon SNS with three subscribed SQS FIFO queues." },
      { id: "D", text: "Amazon MQ with three durable topic subscriptions." }
    ],
    correct: ["B"],
    explanation:
      "Kinesis Data Streams preserves order within a shard, so using the sensor ID as the partition key guarantees per-sensor ordering. Multiple independent consumers can read the same stream simultaneously, each with its own position, and because records are retained (up to 365 days, with seven days easily configured) a consumer can rewind and reprocess after a fix.",
    whyWrong: {
      A: "Standard SQS is best-effort ordering, and once a message is consumed and deleted it cannot be replayed. Three separate queues also means fanning out at the producer.",
      C: "SNS to FIFO queues preserves ordering per message group, but SQS provides no replay of already-processed messages, which the seven-day reprocessing requirement demands.",
      D: "Amazon MQ suits migration of existing JMS/AMQP applications; it is not designed for 200,000-producer telemetry scale and replay of a multi-day window."
    }
  },

  {
    id: "perf-005",
    domain: "Design High-Performing Architectures",
    topic: "Placement groups and HPC networking",
    difficulty: "medium",
    type: "single",
    question:
      "A computational fluid dynamics workload runs across 40 EC2 instances that exchange large volumes of data with each other using MPI. The team needs the lowest possible inter-node network latency and highest packet-per-second performance. Which configuration should they use?",
    options: [
      { id: "A", text: "A cluster placement group in a single Availability Zone with instances using Elastic Fabric Adapter." },
      { id: "B", text: "A spread placement group across three Availability Zones for maximum isolation." },
      { id: "C", text: "A partition placement group with each instance in its own partition." },
      { id: "D", text: "Instances distributed across three Availability Zones behind a Network Load Balancer." }
    ],
    correct: ["A"],
    explanation:
      "A cluster placement group packs instances close together on the same high-bisection-bandwidth network segment within one AZ, giving the lowest latency and highest packet-per-second performance — the right choice for tightly coupled HPC. Elastic Fabric Adapter adds OS-bypass networking that MPI applications use directly.",
    whyWrong: {
      B: "Spread placement groups deliberately separate instances onto distinct hardware to reduce correlated failure, which increases latency — the opposite of the goal, and they are limited to seven instances per AZ per group.",
      C: "Partition placement groups isolate groups of instances across racks for large distributed data stores such as HDFS or Cassandra; they do not minimise latency.",
      D: "Spreading across AZs adds inter-AZ latency, and a load balancer is irrelevant to node-to-node MPI traffic."
    }
  },

  {
    id: "perf-006",
    domain: "Design High-Performing Architectures",
    topic: "Shared file storage selection",
    difficulty: "medium",
    type: "single",
    question:
      "A genomics pipeline runs on hundreds of Linux EC2 instances that must all read and write the same working data set at very high aggregate throughput, with sub-millisecond latency, for the duration of a compute run. The data is staged from and written back to Amazon S3. Which storage service is the best fit for the working data set?",
    options: [
      { id: "A", text: "Amazon FSx for Lustre, linked to the S3 bucket." },
      { id: "B", text: "Amazon EFS in General Purpose performance mode." },
      { id: "C", text: "An io2 EBS volume attached to each instance." },
      { id: "D", text: "Amazon FSx for Windows File Server with a multi-AZ deployment." }
    ],
    correct: ["A"],
    explanation:
      "FSx for Lustre is purpose-built for HPC and machine-learning workloads needing sub-millisecond latency and hundreds of GB/s of aggregate throughput from many clients. Its native S3 integration lets the file system present objects from a linked bucket and write results back, which matches the staging pattern described.",
    whyWrong: {
      B: "EFS is a general-purpose NFS file system with higher latency than Lustre and is not aimed at the extreme aggregate throughput of an HPC run.",
      C: "EBS volumes are attached to a single instance (multi-attach is limited and not a shared file system), so hundreds of instances cannot share the working set.",
      D: "FSx for Windows File Server serves SMB to Windows workloads; these are Linux instances and it is not an HPC file system."
    }
  },

  {
    id: "perf-007",
    domain: "Design High-Performing Architectures",
    topic: "Global Accelerator vs CloudFront",
    difficulty: "hard",
    type: "single",
    question:
      "A multiplayer game backend uses a UDP-based protocol served by Network Load Balancers in three Regions. The studio needs two static IP addresses for client configuration, traffic to enter the AWS backbone as close to the player as possible, and failover between Regions within seconds. Which service should they put in front of the NLBs?",
    options: [
      { id: "A", text: "Amazon CloudFront with the NLBs as custom origins." },
      { id: "B", text: "AWS Global Accelerator with an endpoint group per Region." },
      { id: "C", text: "Amazon Route 53 latency-based routing with health checks." },
      { id: "D", text: "An Application Load Balancer in each Region with cross-zone load balancing enabled." }
    ],
    correct: ["B"],
    explanation:
      "Global Accelerator provides two static anycast IP addresses, moves traffic onto the AWS global network at the nearest edge, and supports TCP and UDP. Because failover is handled at the network layer rather than by DNS, unhealthy endpoints are bypassed within seconds without waiting for client DNS caches to expire.",
    whyWrong: {
      A: "CloudFront is an HTTP/HTTPS content delivery network and cannot proxy a UDP game protocol.",
      C: "Route 53 can route by latency and health, but it is DNS-based: client and resolver caching makes seconds-level failover unreliable, and it provides no static IPs.",
      D: "ALBs are layer 7 HTTP/HTTPS only, have no static IPs, and do nothing for cross-Region routing."
    }
  },

  {
    id: "perf-008",
    domain: "Design High-Performing Architectures",
    topic: "Read scaling with ElastiCache",
    difficulty: "medium",
    type: "single",
    question:
      "A product catalogue API backed by Amazon RDS shows CPU consistently above 90 percent. Analysis shows that roughly 85 percent of queries are identical reads for popular products, and the data changes only a few times per day. The team wants the largest latency and load improvement with minimal schema change. What should they implement first?",
    options: [
      { id: "A", text: "An ElastiCache for Redis cluster holding query results, with the application using a cache-aside pattern." },
      { id: "B", text: "A larger RDS instance class with more vCPUs." },
      { id: "C", text: "RDS Proxy in front of the database to pool connections." },
      { id: "D", text: "Partitioning the catalogue table by product category." }
    ],
    correct: ["A"],
    explanation:
      "When a large majority of reads are identical and the underlying data is nearly static, caching removes most of the load at source. A cache-aside pattern with ElastiCache serves repeat reads from memory in sub-millisecond time and cuts database CPU dramatically, without changing the schema.",
    whyWrong: {
      B: "Scaling up buys headroom at higher cost while the database still executes the same repeated queries; it treats the symptom.",
      C: "RDS Proxy helps with connection churn and failover, not with repeated query execution cost — CPU at 90 percent from query volume will remain.",
      D: "Partitioning is a schema change with modest benefit here, since the problem is repeated identical reads rather than table scan volume."
    }
  },

  /* ==========================================================
   * Design Cost-Optimized Architectures  (exam weight 20%)
   * ========================================================== */

  {
    id: "cost-001",
    domain: "Design Cost-Optimized Architectures",
    topic: "S3 storage class selection",
    difficulty: "medium",
    type: "single",
    question:
      "A company stores 90 TB of analytics exports in S3 Standard. Access patterns are genuinely unpredictable: some objects are read daily for months, others are never read again, and the pattern changes without notice. The team wants automatic cost reduction without risking retrieval delays or writing lifecycle logic. Which storage class should they use?",
    options: [
      { id: "A", text: "S3 Standard-IA, with a lifecycle rule moving objects back to Standard when accessed." },
      { id: "B", text: "S3 Intelligent-Tiering." },
      { id: "C", text: "S3 Glacier Flexible Retrieval with expedited retrievals enabled." },
      { id: "D", text: "S3 One Zone-IA with Cross-Region Replication for durability." }
    ],
    correct: ["B"],
    explanation:
      "S3 Intelligent-Tiering is designed precisely for unpredictable or unknown access patterns. It moves objects between frequent and infrequent access tiers automatically based on observed access, charges a small per-object monitoring fee, and imposes no retrieval fees or delays in those tiers.",
    whyWrong: {
      A: "Standard-IA charges a retrieval fee and a 30-day minimum duration; frequently read objects would become more expensive, and lifecycle rules cannot move objects back on access.",
      C: "Glacier Flexible Retrieval introduces retrieval time and fees, which the requirement rules out for objects that may be read daily.",
      D: "One Zone-IA stores data in a single AZ, and adding replication to compensate reintroduces the cost the design was meant to save."
    }
  },

  {
    id: "cost-002",
    domain: "Design Cost-Optimized Architectures",
    topic: "Compute pricing models",
    difficulty: "medium",
    type: "single",
    question:
      "A company runs a steady baseline of 40 EC2 instances continuously, plus a nightly batch job on 200 instances that can be interrupted and restarted safely. Management wants the lowest total compute cost over the next three years while retaining the freedom to change instance families as the platform evolves. Which purchasing combination should the architect recommend?",
    options: [
      { id: "A", text: "Standard Reserved Instances for all 240 instances." },
      { id: "B", text: "Compute Savings Plans for the 40-instance baseline and Spot Instances for the nightly batch." },
      { id: "C", text: "On-Demand for the baseline and Convertible Reserved Instances for the batch." },
      { id: "D", text: "Dedicated Hosts for the baseline and On-Demand for the batch." }
    ],
    correct: ["B"],
    explanation:
      "The baseline is predictable and always running, so a Compute Savings Plan buys a deep discount while remaining flexible across instance family, size, Region, and even Fargate and Lambda — matching the requirement to change families later. The batch is interruption-tolerant, which is the textbook case for Spot Instances and their far larger discount.",
    whyWrong: {
      A: "Standard RIs lock you to an instance family, conflicting with the flexibility requirement, and committing to 200 batch instances wastes the discount on capacity used only a few hours a night.",
      C: "This inverts the correct mapping: the steady baseline is what deserves a commitment, and reserving capacity for an interruptible nightly job is wasteful.",
      D: "Dedicated Hosts are the most expensive option and are chosen for licensing or compliance isolation, not cost optimisation."
    }
  },

  {
    id: "cost-003",
    domain: "Design Cost-Optimized Architectures",
    topic: "Data transfer and NAT cost",
    difficulty: "hard",
    type: "single",
    question:
      "A cost review reveals a large monthly charge for NAT gateway data processing. Investigation shows that the traffic is EC2 instances in private subnets across three AZs pulling several terabytes of objects per day from an S3 bucket in the same Region. What is the most effective change?",
    options: [
      { id: "A", text: "Consolidate to a single NAT gateway shared by all three AZs." },
      { id: "B", text: "Create a gateway VPC endpoint for S3 so the traffic bypasses the NAT gateway entirely." },
      { id: "C", text: "Replace the NAT gateways with NAT instances on t4g.micro." },
      { id: "D", text: "Enable S3 Requester Pays on the bucket." }
    ],
    correct: ["B"],
    explanation:
      "In-Region traffic to S3 does not need a NAT gateway at all. A gateway VPC endpoint routes it privately, carries no hourly or per-GB charge, and removes both the NAT data-processing fee and the associated data-transfer charge for that traffic. This is the single highest-impact change.",
    whyWrong: {
      A: "One NAT gateway saves two hourly charges but leaves the per-GB processing fee — the dominant cost here — untouched, and it introduces cross-AZ data transfer charges plus an AZ-level single point of failure.",
      C: "NAT instances shift the cost to EC2 and become a throughput bottleneck at terabytes per day, while adding patching and HA burden.",
      D: "Requester Pays moves the bill to the requester, who in this case is the same company; it does not reduce total cost."
    }
  },

  {
    id: "cost-004",
    domain: "Design Cost-Optimized Architectures",
    topic: "Serverless vs container cost",
    difficulty: "medium",
    type: "single",
    question:
      "An internal API receives about 60,000 requests per month, arriving in short bursts during business hours and none overnight. It currently runs on two m5.large EC2 instances behind an ALB, sized for peak. Each request completes in roughly 200 ms. What is the most cost-effective architecture?",
    options: [
      { id: "A", text: "Move the API to AWS Lambda behind Amazon API Gateway." },
      { id: "B", text: "Move the API to ECS on Fargate with a minimum of two always-running tasks." },
      { id: "C", text: "Keep the EC2 instances but purchase three-year Standard Reserved Instances." },
      { id: "D", text: "Move to a single larger EC2 instance and remove the load balancer." }
    ],
    correct: ["A"],
    explanation:
      "The workload is low volume, spiky, and idle for large parts of the day, with short execution times — the profile Lambda's per-request, per-millisecond billing suits best. At roughly 60,000 short invocations a month the compute cost is negligible, and nothing is paid for the overnight idle period.",
    whyWrong: {
      B: "Fargate with two always-running tasks still bills continuously for idle capacity overnight; it removes instance management but not the idle cost.",
      C: "A three-year commitment locks in payment for capacity that is unused most of the time, optimising the price of the wrong architecture.",
      D: "A single instance removes redundancy and still runs, and bills, 24 hours a day for a workload used a few hours a day."
    }
  },

  {
    id: "cost-005",
    domain: "Design Cost-Optimized Architectures",
    topic: "Lifecycle policies and archival",
    difficulty: "medium",
    type: "single",
    question:
      "A regulated firm must retain audit logs in S3 for seven years. Logs are queried frequently during their first 30 days, occasionally for the rest of the first year, and after that only during a rare audit where a 12-hour retrieval window is acceptable. Which lifecycle configuration minimises cost?",
    options: [
      { id: "A", text: "Standard for 30 days, then Standard-IA until day 365, then Glacier Deep Archive until expiry at seven years." },
      { id: "B", text: "Standard for 30 days, then Glacier Instant Retrieval for seven years." },
      { id: "C", text: "Standard-IA immediately, then Glacier Flexible Retrieval after one year." },
      { id: "D", text: "Intelligent-Tiering for the full seven years with no lifecycle rules." }
    ],
    correct: ["A"],
    explanation:
      "The lifecycle should track the described access pattern. Standard covers the hot first 30 days, Standard-IA suits occasional access for the remainder of the year, and Glacier Deep Archive — the cheapest S3 storage — fits data touched only in a rare audit where a 12-hour standard retrieval is acceptable.",
    whyWrong: {
      B: "Glacier Instant Retrieval costs more than Deep Archive and buys millisecond retrieval that the 12-hour tolerance makes unnecessary for six of the seven years.",
      C: "Moving to Standard-IA immediately incurs retrieval fees during the frequently queried first 30 days, and Flexible Retrieval is more expensive than Deep Archive for the long tail.",
      D: "Intelligent-Tiering avoids retrieval fees but pays per-object monitoring for seven years and, without archive access tiers configured, will not reach Deep Archive pricing for a fully predictable pattern."
    }
  },

  {
    id: "cost-006",
    domain: "Design Cost-Optimized Architectures",
    topic: "Right-sizing and cost visibility",
    difficulty: "easy",
    type: "single",
    question:
      "A CFO asks which EC2 instances across five linked accounts are consistently over-provisioned, and wants specific downsizing recommendations with projected savings, without installing third-party tooling. Which AWS capability should the architect use?",
    options: [
      { id: "A", text: "AWS Compute Optimizer, reviewed from the management account for the organisation." },
      { id: "B", text: "Amazon CloudWatch dashboards showing average CPU per instance." },
      { id: "C", text: "AWS Budgets with an alert at 80 percent of forecast spend." },
      { id: "D", text: "AWS Config rules checking that instances match an approved instance-type list." }
    ],
    correct: ["A"],
    explanation:
      "Compute Optimizer analyses utilisation metrics with machine learning and returns explicit right-sizing recommendations — including the suggested instance type and estimated savings — and can be enabled across an organisation so the management account sees all linked accounts.",
    whyWrong: {
      B: "CloudWatch shows raw utilisation but produces no recommendation or savings projection; the analysis would be manual.",
      C: "Budgets alerts on spend thresholds; it says nothing about which instances are oversized.",
      D: "Config enforces configuration compliance against rules you define; it does not evaluate utilisation or recommend sizes."
    }
  },

  {
    id: "cost-007",
    domain: "Design Cost-Optimized Architectures",
    topic: "Environment scheduling and idle resources",
    difficulty: "easy",
    type: "single",
    question:
      "Development and test environments consisting of EC2 instances and RDS databases run 24 hours a day but are only used between 08:00 and 19:00 on weekdays. The team wants to cut the cost of these environments with minimal engineering effort and no change to the environments themselves. What should they do?",
    options: [
      { id: "A", text: "Use AWS Systems Manager to stop the instances and databases outside working hours on a schedule." },
      { id: "B", text: "Purchase one-year Reserved Instances for the development environments." },
      { id: "C", text: "Move the development environments to Spot Instances." },
      { id: "D", text: "Reduce the instance sizes by one step across all development resources." }
    ],
    correct: ["A"],
    explanation:
      "Non-production environments used 55 hours out of 168 per week are idle roughly two-thirds of the time. Scheduling automated stop and start with Systems Manager eliminates compute charges during idle hours with no architectural change, and stopped EC2 and RDS instances do not incur instance-hour charges.",
    whyWrong: {
      B: "Reserved Instances commit to paying for capacity around the clock, which is the opposite of what a part-time environment needs.",
      C: "Spot can be cheap but interruptions disrupt developers mid-task, and it does not address the fundamental problem of paying for idle hours.",
      D: "Downsizing yields a modest, one-off saving while still paying 24 hours a day for environments used a third of the time."
    }
  },

  {
    id: "cost-008",
    domain: "Design Cost-Optimized Architectures",
    topic: "EBS snapshot and volume cost",
    difficulty: "medium",
    type: "single",
    question:
      "An audit finds 12 TB of EBS snapshots, many years old, and 4 TB of unattached gp2 volumes left behind by terminated instances. The company wants to reduce storage spend while keeping a defensible retention policy for snapshots going forward. Which combination should the architect implement?",
    options: [
      { id: "A", text: "Delete unattached volumes after verification, and use Amazon Data Lifecycle Manager to create and expire snapshots on a defined retention schedule." },
      { id: "B", text: "Convert the unattached gp2 volumes to gp3 and keep all snapshots indefinitely for safety." },
      { id: "C", text: "Move the snapshots to S3 Glacier Deep Archive using a lifecycle rule on the snapshot bucket." },
      { id: "D", text: "Enable EBS encryption on all volumes, which compresses the data and reduces stored size." }
    ],
    correct: ["A"],
    explanation:
      "Unattached volumes bill continuously for provisioned capacity and are pure waste once verified as unneeded. Data Lifecycle Manager automates snapshot creation and, crucially, deletion on a retention schedule, so old snapshots stop accumulating while the policy remains documented and enforceable.",
    whyWrong: {
      B: "gp3 is cheaper per GiB, but an unattached volume delivers no value at any price, and keeping every snapshot forever is the behaviour that created the 12 TB problem.",
      C: "Snapshots are stored in S3 managed by EBS; you do not have a bucket to apply lifecycle rules to. Snapshot Archive is the EBS-native tier for rarely used snapshots.",
      D: "EBS encryption does not compress data and does not change the amount of storage billed."
    }
  },

  /* ==========================================================
   * Batch 2 — fills the remaining syllabus subjects and deepens
   * the highest-weight ones.
   * ========================================================== */

  {
    id: "sec-009",
    domain: "Design Secure Architectures",
    topic: "Identity federation and IAM Identity Center",
    difficulty: "medium",
    type: "single",
    question:
      "An enterprise with 40 AWS accounts under AWS Organizations wants its 900 staff to sign in with their existing corporate directory credentials and receive different permissions depending on which account they are entering. Creating IAM users per account is explicitly ruled out. What should the architect implement?",
    options: [
      { id: "A", text: "AWS IAM Identity Center connected to the corporate identity provider, with permission sets assigned to groups per account." },
      { id: "B", text: "An IAM user in the management account for each employee, with cross-account roles they can assume." },
      { id: "C", text: "Amazon Cognito user pools federated to the corporate directory, with users assuming roles per account." },
      { id: "D", text: "An IAM SAML identity provider configured separately in each of the 40 accounts, with one role per employee." }
    ],
    correct: ["A"],
    explanation:
      "IAM Identity Center is the workforce access service for Organizations. It federates to an external identity provider so staff keep their existing credentials, and permission sets are assigned to groups and applied across whichever accounts they need — one place to manage, no per-account IAM users.",
    whyWrong: {
      B: "This still creates 900 long-lived IAM users, which the requirement rules out, and leaves credential lifecycle managed separately from the corporate directory.",
      C: "Cognito is for application end users, not workforce access to the AWS console and CLI.",
      D: "Configuring the identity provider and per-employee roles 40 times is exactly the administrative burden Identity Center exists to remove."
    }
  },

  {
    id: "sec-010",
    domain: "Design Secure Architectures",
    topic: "Organizations SCPs and guardrails",
    difficulty: "medium",
    type: "single",
    question:
      "A security team must guarantee that no one — including account administrators — can stop or delete CloudTrail logging in any of the organization's member accounts. Administrators must otherwise keep their existing permissions. What is the most effective control?",
    options: [
      { id: "A", text: "A service control policy attached to the organizational root that denies cloudtrail:StopLogging, cloudtrail:DeleteTrail and cloudtrail:UpdateTrail." },
      { id: "B", text: "An IAM policy attached to every administrator in every account denying those CloudTrail actions." },
      { id: "C", text: "An AWS Config rule that detects a disabled trail and raises a finding." },
      { id: "D", text: "A permissions boundary applied to the administrator roles in each member account." }
    ],
    correct: ["A"],
    explanation:
      "An SCP sets the maximum permissions available in member accounts, and nothing an account administrator does can exceed it. A deny on the CloudTrail mutation actions at the root therefore makes disabling logging impossible in member accounts while leaving all other permissions intact.",
    whyWrong: {
      B: "An account administrator can edit or detach an IAM policy in their own account, so this is advisory rather than a guarantee.",
      C: "Config detects the change after it happens. It does not prevent it, and the requirement is prevention.",
      D: "Permissions boundaries constrain individual identities and must be applied and maintained per identity per account; an administrator with IAM rights can alter them."
    }
  },

  {
    id: "sec-011",
    domain: "Design Secure Architectures",
    topic: "S3 access controls and Block Public Access",
    difficulty: "easy",
    type: "single",
    question:
      "After an audit found two buckets unintentionally readable by anyone on the internet, a company wants a control that prevents any bucket in the account from being made public, regardless of what bucket policies or ACLs individual teams write in future. What should be applied?",
    options: [
      { id: "A", text: "Enable S3 Block Public Access at the account level." },
      { id: "B", text: "Add an explicit deny for s3:GetObject to every existing bucket policy." },
      { id: "C", text: "Enable default SSE-S3 encryption on all buckets." },
      { id: "D", text: "Turn on S3 Versioning and server access logging for all buckets." }
    ],
    correct: ["A"],
    explanation:
      "Account-level Block Public Access overrides bucket policies and ACLs that would otherwise grant public access, and it applies to buckets created later as well. That makes it a preventative guardrail rather than a per-bucket fix.",
    whyWrong: {
      B: "This only covers buckets that exist today, and a team can edit its own bucket policy tomorrow.",
      C: "Encryption at rest protects stored data; it has no bearing on who is authorised to read an object.",
      D: "Versioning and logging aid recovery and investigation after the fact. Neither prevents public exposure."
    }
  },

  {
    id: "sec-012",
    domain: "Design Secure Architectures",
    topic: "Certificate management and encryption in transit",
    difficulty: "medium",
    type: "single",
    question:
      "A public website is served through Amazon CloudFront with an Application Load Balancer origin. The company wants HTTPS on its custom domain with certificates that renew automatically and cost nothing. Where must the certificates be requested?",
    options: [
      { id: "A", text: "An ACM certificate in us-east-1 for the CloudFront distribution, and a separate ACM certificate in the ALB's own Region for the ALB." },
      { id: "B", text: "A single ACM certificate in the ALB's Region, referenced by both CloudFront and the ALB." },
      { id: "C", text: "A certificate imported into ACM from a third-party certificate authority, in any Region." },
      { id: "D", text: "A certificate stored in AWS Secrets Manager and referenced by both services." }
    ],
    correct: ["A"],
    explanation:
      "CloudFront only accepts certificates from ACM in us-east-1, because it is a global service managed from that Region. An ALB, being regional, needs a certificate in its own Region. Two ACM certificates are therefore required, and ACM public certificates are free and renew automatically when DNS validation is in place.",
    whyWrong: {
      B: "CloudFront cannot use a certificate from an arbitrary Region — the us-east-1 requirement is specific and enforced.",
      C: "Imported certificates are supported but AWS cannot renew them automatically, which the requirement demands.",
      D: "Secrets Manager stores secrets; it is not a certificate source for CloudFront or ALB listeners."
    }
  },

  {
    id: "sec-013",
    domain: "Design Secure Architectures",
    topic: "Threat detection with GuardDuty and Security Hub",
    difficulty: "medium",
    type: "single",
    question:
      "A company wants continuous detection of compromised credentials, cryptocurrency-mining activity and communication with known-malicious IP addresses across 25 accounts, with all findings visible in one place and no agents to deploy. What should the architect enable?",
    options: [
      { id: "A", text: "Amazon GuardDuty across the organization with a delegated administrator account, and AWS Security Hub to aggregate findings." },
      { id: "B", text: "Amazon Inspector in every account, with results exported to Amazon S3." },
      { id: "C", text: "VPC Flow Logs delivered to CloudWatch Logs, with metric filters for suspicious ports." },
      { id: "D", text: "AWS Config conformance packs applied to all accounts." }
    ],
    correct: ["A"],
    explanation:
      "GuardDuty analyses CloudTrail events, VPC flow logs and DNS logs continuously with no agents, and detects exactly the categories named — credential misuse, mining, and traffic to known-bad destinations. Enabling it organization-wide with a delegated administrator, and aggregating in Security Hub, gives the single view required.",
    whyWrong: {
      B: "Inspector scans workloads for software vulnerabilities and unintended network exposure; it does not detect credential compromise or malicious network activity.",
      C: "Flow logs are raw data. Writing and maintaining detection logic over them is precisely the work GuardDuty removes, and DNS and CloudTrail signals would still be missing.",
      D: "Config evaluates resource configuration against rules. It reports non-compliance, not active threats."
    }
  },

  {
    id: "sec-014",
    domain: "Design Secure Architectures",
    topic: "Auditing with CloudTrail and Config",
    difficulty: "medium",
    type: "multi",
    question:
      "An investigator needs to answer two questions about a production security group: which principal changed it and when, and what its rules looked like on each day of the past month. Which TWO services provide these answers?",
    options: [
      { id: "A", text: "AWS CloudTrail, for the API call that modified the security group and the identity that made it." },
      { id: "B", text: "AWS Config, for the configuration timeline showing the security group's state over time." },
      { id: "C", text: "Amazon CloudWatch metrics, for a per-rule change counter." },
      { id: "D", text: "VPC Flow Logs, for the historical rule set applied to each flow." },
      { id: "E", text: "AWS Trusted Advisor, for a daily snapshot of security group configuration." }
    ],
    correct: ["A", "B"],
    explanation:
      "The two services answer different halves of the question. CloudTrail records API activity — who called AuthorizeSecurityGroupIngress, from where, and when. Config records resource configuration over time, so it can show the security group's exact rules on any given day and how they changed.",
    whyWrong: {
      C: "CloudWatch collects metrics and logs; it does not maintain resource configuration history.",
      D: "Flow logs record traffic that was accepted or rejected, not the rule set itself or who changed it.",
      E: "Trusted Advisor gives current best-practice checks, not a historical configuration timeline."
    }
  },

  {
    id: "sec-015",
    domain: "Design Secure Architectures",
    topic: "IAM policy evaluation",
    difficulty: "hard",
    type: "single",
    question:
      "A platform team lets application teams create their own IAM roles, but must guarantee that no role they create can ever exceed a fixed set of permissions — even though the application teams hold iam:CreateRole and iam:AttachRolePolicy. Which mechanism enforces this?",
    options: [
      { id: "A", text: "Attach a permissions boundary policy and require, via a condition in the application team's own policy, that any role they create has that boundary attached." },
      { id: "B", text: "Attach the maximum permission set as a managed policy to every role the application teams create." },
      { id: "C", text: "Apply a service control policy that denies iam:CreateRole in the account." },
      { id: "D", text: "Enable IAM Access Analyzer to report roles that exceed the intended permissions." }
    ],
    correct: ["A"],
    explanation:
      "A permissions boundary caps the maximum permissions an identity can have — the effective permissions are the intersection of the boundary and the attached policies. Conditioning the team's iam:CreateRole on iam:PermissionsBoundary means every role they create is born capped, no matter what policies they attach later.",
    whyWrong: {
      B: "Attaching a policy grants permissions; it does not cap them. The team could attach an additional, broader policy afterwards.",
      C: "Denying role creation outright removes the delegation the platform team wants to provide.",
      D: "Access Analyzer reports findings after the fact. It is detection, not enforcement."
    }
  },

  {
    id: "sec-016",
    domain: "Design Secure Architectures",
    topic: "S3 encryption options",
    difficulty: "medium",
    type: "single",
    question:
      "An application writes several million small objects per day to a bucket encrypted with SSE-KMS using a customer managed key. The KMS request charges have become a significant line item, but the security team requires that the customer managed key remain in use. What reduces the cost with the least change?",
    options: [
      { id: "A", text: "Enable S3 Bucket Keys on the bucket." },
      { id: "B", text: "Switch the bucket to SSE-S3 encryption." },
      { id: "C", text: "Batch the objects into larger archives before upload." },
      { id: "D", text: "Move the objects to S3 Glacier Instant Retrieval." }
    ],
    correct: ["A"],
    explanation:
      "S3 Bucket Keys have S3 generate a short-lived bucket-level data key from the KMS key and reuse it for many objects, which cuts KMS request traffic — and therefore request charges — dramatically, by up to 99 percent. The customer managed key stays in use and no application change is needed.",
    whyWrong: {
      B: "SSE-S3 would remove the KMS charges but abandons the customer managed key the security team requires.",
      C: "Batching changes the application and the access pattern, which is a far larger change than a bucket setting.",
      D: "Storage class affects storage pricing and retrieval, not the number of KMS requests made when objects are written or read."
    }
  },

  {
    id: "sec-017",
    domain: "Design Secure Architectures",
    topic: "VPC endpoints and private connectivity",
    difficulty: "medium",
    type: "single",
    question:
      "Lambda functions attached to private subnets must retrieve database credentials from AWS Secrets Manager. There is no NAT gateway and the security team will not add internet egress. What is required?",
    options: [
      { id: "A", text: "An interface VPC endpoint for Secrets Manager in the subnets the functions use, with a security group allowing HTTPS." },
      { id: "B", text: "A gateway VPC endpoint for Secrets Manager added to the subnets' route tables." },
      { id: "C", text: "An internet gateway attached to the VPC with a route from the private subnets." },
      { id: "D", text: "Copying the secrets into Lambda environment variables at deployment time." }
    ],
    correct: ["A"],
    explanation:
      "Secrets Manager is reached through an interface VPC endpoint, which places an elastic network interface with a private IP into your subnets and routes the API calls privately over PrivateLink. The endpoint's security group must permit HTTPS from the function's security group.",
    whyWrong: {
      B: "Gateway endpoints exist only for Amazon S3 and DynamoDB. Every other service uses interface endpoints.",
      C: "A route to an internet gateway would give the subnets internet egress, which the security team has ruled out — and would also make them public subnets.",
      D: "Baking secrets into environment variables defeats the purpose of Secrets Manager, breaks rotation, and exposes the values to anyone who can read the function configuration."
    }
  },

  {
    id: "res-009",
    domain: "Design Resilient Architectures",
    topic: "Event-driven patterns with EventBridge",
    difficulty: "medium",
    type: "single",
    question:
      "An order service currently calls the invoicing, analytics and notification services synchronously over HTTP. Adding a fourth consumer means changing the order service again, and one slow consumer delays the whole request. The team wants consumers to be added without touching the producer, and a failed delivery to be retried and eventually captured. What should they adopt?",
    options: [
      { id: "A", text: "Publish order events to Amazon EventBridge and let each consumer subscribe with its own rule, retry policy and dead-letter queue." },
      { id: "B", text: "Have the order service write to a shared Amazon RDS table that each consumer polls." },
      { id: "C", text: "Put an Application Load Balancer in front of the consumers and have the order service call it." },
      { id: "D", text: "Increase the order service's HTTP client timeout and add a retry loop for each consumer." }
    ],
    correct: ["A"],
    explanation:
      "EventBridge inverts the dependency: the producer emits an event once and knows nothing about consumers. Each consumer attaches its own rule, so a fourth one is added with no producer change, and EventBridge retries failed deliveries and sends exhausted events to a dead-letter queue.",
    whyWrong: {
      B: "A shared database as an integration point couples every consumer to the producer's schema and turns into a polling and locking problem.",
      C: "A load balancer distributes calls to one pool of targets; it does not fan a single event out to several independent consumers.",
      D: "This keeps the synchronous coupling and makes the latency problem worse, since the producer now waits through retries."
    }
  },

  {
    id: "res-010",
    domain: "Design Resilient Architectures",
    topic: "Load balancer selection",
    difficulty: "medium",
    type: "single",
    question:
      "A financial data feed must be load balanced across EC2 targets. Requirements: a static IP address per Availability Zone that clients can allowlist in their firewalls, TCP pass-through so the application terminates TLS itself, and the ability to sustain millions of requests per second with very low latency. Which load balancer fits?",
    options: [
      { id: "A", text: "Network Load Balancer" },
      { id: "B", text: "Application Load Balancer" },
      { id: "C", text: "Gateway Load Balancer" },
      { id: "D", text: "Classic Load Balancer" }
    ],
    correct: ["A"],
    explanation:
      "The Network Load Balancer operates at layer 4, provides a static IP per Availability Zone (and supports Elastic IPs), passes TCP through without terminating TLS, and is designed for millions of requests per second at very low latency. Every requirement points at it.",
    whyWrong: {
      B: "An ALB works at layer 7, terminates the connection, and has no static IP — clients would have to allowlist a changing set of addresses.",
      C: "A Gateway Load Balancer is for inserting third-party virtual network appliances such as firewalls into the traffic path, not for balancing application targets.",
      D: "The Classic Load Balancer is the previous generation, offers no static IP, and is not recommended for new designs."
    }
  },

  {
    id: "res-011",
    domain: "Design Resilient Architectures",
    topic: "Multi-AZ vs multi-Region design",
    difficulty: "hard",
    type: "single",
    question:
      "An application is deployed across three Availability Zones in one Region with Multi-AZ RDS and an Auto Scaling group. Leadership asks what this design protects against and what it does not. Which statement is correct?",
    options: [
      { id: "A", text: "It survives the loss of an Availability Zone, but a Region-wide service impairment would still take the application down; surviving that requires a second Region." },
      { id: "B", text: "It survives both Availability Zone and Region failures, because Availability Zones are physically separate data centres." },
      { id: "C", text: "It survives Region failure only if the RDS instance has read replicas in the same Region." },
      { id: "D", text: "It provides no protection beyond a single Availability Zone unless a Global Accelerator is added." }
    ],
    correct: ["A"],
    explanation:
      "Multi-AZ is the standard protection against the loss of one Availability Zone: the standby is in another AZ and Auto Scaling replaces capacity elsewhere. It does nothing for an event affecting the whole Region, which is why a genuine Regional failure requirement forces a multi-Region design with cross-Region data replication and a routing mechanism.",
    whyWrong: {
      B: "Availability Zones are separate facilities but they are within one Region and share Regional service endpoints, so a Regional impairment can affect all of them.",
      C: "Read replicas in the same Region share the Region's fate; only a cross-Region replica helps with Regional loss.",
      D: "Multi-AZ genuinely does protect against single-AZ failure. Global Accelerator affects traffic routing, not the resilience of the deployment itself."
    }
  },

  {
    id: "res-012",
    domain: "Design Resilient Architectures",
    topic: "Backup and restore with AWS Backup",
    difficulty: "medium",
    type: "single",
    question:
      "A regulated company must apply one retention policy to EBS volumes, RDS databases, EFS file systems and DynamoDB tables across 20 accounts, copy the backups to a second Region, and make it impossible for anyone to delete a backup before its retention period expires. What should the architect use?",
    options: [
      { id: "A", text: "AWS Backup with organization-wide backup policies, cross-Region copy, and AWS Backup Vault Lock in compliance mode." },
      { id: "B", text: "Amazon Data Lifecycle Manager policies in each account, with a Lambda function copying snapshots to the second Region." },
      { id: "C", text: "A scheduled Lambda function per account calling each service's native snapshot API." },
      { id: "D", text: "S3 Cross-Region Replication with Object Lock on a bucket holding exported data." }
    ],
    correct: ["A"],
    explanation:
      "AWS Backup is the single control plane across those services, backup policies can be applied through Organizations to all accounts, backup plans handle cross-Region copies, and Vault Lock in compliance mode makes recovery points immutable — nobody, including the root user, can delete them before expiry.",
    whyWrong: {
      B: "Data Lifecycle Manager covers EBS snapshots and AMIs, not RDS, EFS and DynamoDB, and the custom copy function reintroduces the operational burden.",
      C: "Hand-rolled per-service scripts in 20 accounts is exactly the fragmented approach the requirement is trying to replace, and gives no immutability guarantee.",
      D: "Object Lock protects objects in S3, but the sources here are EBS, RDS, EFS and DynamoDB, which would first have to be exported by something else."
    }
  },

  {
    id: "res-013",
    domain: "Design Resilient Architectures",
    topic: "Fault isolation and blast radius",
    difficulty: "hard",
    type: "single",
    question:
      "A multi-tenant SaaS processes tenant jobs from a single SQS queue with a Lambda function. When one large tenant submits tens of thousands of jobs, every other tenant's jobs sit behind them and the shared function consumes the account's entire concurrency. What change best limits the blast radius?",
    options: [
      { id: "A", text: "Give each tenant tier its own queue and Lambda function with reserved concurrency, so one tenant's backlog cannot consume the others' capacity." },
      { id: "B", text: "Increase the Lambda function's memory so each job finishes faster." },
      { id: "C", text: "Switch the queue to FIFO so jobs are processed strictly in order." },
      { id: "D", text: "Raise the account concurrency quota and set a longer visibility timeout." }
    ],
    correct: ["A"],
    explanation:
      "This is the bulkhead pattern. Partitioning the workload into separate queues with reserved concurrency per partition means a flood from one tenant fills only its own queue and can only use its own reserved concurrency, so other tenants are unaffected. Reserved concurrency both guarantees and caps a function's share.",
    whyWrong: {
      B: "Faster jobs shorten the backlog but do not stop one tenant from monopolising a shared queue and shared concurrency.",
      C: "FIFO enforces ordering, which would make head-of-line blocking worse, not better.",
      D: "A bigger shared pool is still a shared pool — the same tenant can consume it, just at a higher number."
    }
  },

  {
    id: "res-014",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "medium",
    type: "single",
    question:
      "A payment reconciliation pipeline must process messages for a given account number in the exact order they were produced, and must never process the same message twice within a five-minute window. Throughput is roughly 200 messages per second. Which queue configuration meets this?",
    options: [
      { id: "A", text: "An SQS FIFO queue using the account number as the message group ID, with content-based deduplication enabled." },
      { id: "B", text: "An SQS standard queue with a visibility timeout longer than the processing time." },
      { id: "C", text: "An SQS standard queue with the consumer sorting messages by timestamp before processing." },
      { id: "D", text: "An SQS FIFO queue using a unique message group ID per message." }
    ],
    correct: ["A"],
    explanation:
      "FIFO queues guarantee ordering within a message group, so using the account number as the group ID orders each account's messages while still allowing different accounts to be processed in parallel. Deduplication removes duplicates sent within a five-minute window, and 200 messages per second is within the FIFO limit.",
    whyWrong: {
      B: "Standard queues offer best-effort ordering and at-least-once delivery, so neither requirement is met.",
      C: "Sorting in the consumer cannot reconstruct order across separate receives, and does nothing about duplicates.",
      D: "A unique group ID per message means every message is in its own group, which removes all ordering guarantees — the opposite of the requirement."
    }
  },

  {
    id: "res-015",
    domain: "Design Resilient Architectures",
    topic: "Auto Scaling and health checks",
    difficulty: "medium",
    type: "single",
    question:
      "During scale-in, users occasionally see errors because instances are terminated while still finishing in-flight requests. The team needs terminating instances to stop receiving new requests and be given up to two minutes to finish existing ones. What should they configure?",
    options: [
      { id: "A", text: "An Auto Scaling lifecycle hook on instance termination, combined with target group deregistration delay on the load balancer." },
      { id: "B", text: "A longer Auto Scaling cooldown period between scaling activities." },
      { id: "C", text: "Instance scale-in protection on every instance in the group." },
      { id: "D", text: "A step scaling policy instead of target tracking." }
    ],
    correct: ["A"],
    explanation:
      "Deregistration delay (connection draining) makes the load balancer stop sending new requests while allowing in-flight ones to complete. A termination lifecycle hook holds the instance in a wait state so that draining, and any custom cleanup, finishes before the instance is actually terminated.",
    whyWrong: {
      B: "Cooldown controls how soon the next scaling activity may start; it does not protect requests already in flight on an instance being removed.",
      C: "Scale-in protection prevents instances from being chosen for termination at all, which blocks scale-in rather than making it graceful.",
      D: "The choice of scaling policy determines when and how much to scale, not how gracefully an instance leaves the group."
    }
  },

  {
    id: "perf-009",
    domain: "Design High-Performing Architectures",
    topic: "Compute selection for workloads",
    difficulty: "medium",
    type: "single",
    question:
      "A video transcoding service runs continuously at 85–95 percent CPU on t3.large instances. Throughput is inconsistent and the bill includes recurring charges the team does not understand. What is the correct instance choice?",
    options: [
      { id: "A", text: "Move to a compute-optimised family such as C-series, sized to the sustained CPU requirement." },
      { id: "B", text: "Stay on T-series but enable unlimited mode to remove throttling." },
      { id: "C", text: "Move to a memory-optimised R-series instance for more headroom." },
      { id: "D", text: "Move to a burstable t3.micro and scale out horizontally." }
    ],
    correct: ["A"],
    explanation:
      "Burstable T instances are designed for workloads that idle most of the time and burst occasionally; they earn CPU credits while idle and spend them while busy. A sustained 85–95 percent CPU load exhausts credits, which explains both the inconsistent throughput and the surprise charges. A compute-optimised family gives full sustained CPU with predictable performance.",
    whyWrong: {
      B: "Unlimited mode removes the throttling but bills for surplus credits — that is the recurring charge already appearing on the bill, so this makes cost worse.",
      C: "The bottleneck is CPU, not memory. Memory-optimised instances cost more per vCPU and do not address it.",
      D: "A smaller burstable instance has the same credit problem in a more acute form, and scaling out multiplies it."
    }
  },

  {
    id: "perf-010",
    domain: "Design High-Performing Architectures",
    topic: "Analytics with Athena and Redshift",
    difficulty: "medium",
    type: "single",
    question:
      "Analysts want to run occasional ad-hoc SQL over 40 TB of JSON logs already sitting in Amazon S3. Queries run a few times a week, there is no team to operate a cluster, and query cost must be kept low. What should the architect recommend?",
    options: [
      { id: "A", text: "Amazon Athena, with the data converted to partitioned Parquet." },
      { id: "B", text: "An Amazon Redshift provisioned cluster with the data loaded via COPY." },
      { id: "C", text: "An Amazon EMR cluster running Hive, started and stopped around each query." },
      { id: "D", text: "An Amazon RDS for PostgreSQL instance with the logs imported." }
    ],
    correct: ["A"],
    explanation:
      "Athena is serverless SQL directly over S3 with nothing to operate, which suits infrequent ad-hoc analysis. Because it bills per byte scanned, converting the JSON to columnar Parquet and partitioning it cuts both query time and cost substantially — often by an order of magnitude.",
    whyWrong: {
      B: "A provisioned Redshift cluster bills continuously and needs operating, which is poor value for a few queries a week.",
      C: "EMR is powerful but is a cluster to configure, tune and manage — the opposite of the no-operations requirement.",
      D: "Loading 40 TB of logs into a relational database is a large ETL and storage exercise, and RDS is not designed as an analytics engine at that scale."
    }
  },

  {
    id: "perf-011",
    domain: "Design High-Performing Architectures",
    topic: "Auto Scaling policies and warm pools",
    difficulty: "medium",
    type: "single",
    question:
      "Instances in an Auto Scaling group take about eight minutes to boot because of a long application initialisation. Traffic spikes arrive within two minutes, so scale-out consistently arrives too late. Keeping the full fleet running permanently is too expensive. What should the architect implement?",
    options: [
      { id: "A", text: "A warm pool of pre-initialised, stopped instances that the group can bring into service quickly." },
      { id: "B", text: "A shorter health check grace period so instances enter service sooner." },
      { id: "C", text: "A more aggressive target tracking policy with a lower CPU target." },
      { id: "D", text: "Scheduled scaling that adds capacity every hour." }
    ],
    correct: ["A"],
    explanation:
      "Warm pools hold instances that have already completed initialisation in a stopped (or hibernated) state, charged only for storage rather than compute. When the group scales out, it starts them instead of building from scratch, collapsing an eight-minute boot into seconds.",
    whyWrong: {
      B: "The grace period only delays health checks; the application still needs eight minutes to initialise, and cutting it short risks terminating healthy instances.",
      C: "A lower CPU target triggers scaling earlier but the new instance still takes eight minutes to arrive, so it does not close a two-minute gap.",
      D: "Scheduled scaling suits predictable patterns. These spikes are not on a schedule, and hourly capacity additions would waste money without guaranteeing coverage."
    }
  },

  {
    id: "perf-012",
    domain: "Design High-Performing Architectures",
    topic: "Data transfer and migration services",
    difficulty: "medium",
    type: "single",
    question:
      "A media company must move 600 TB from an on-premises NAS into Amazon S3. The site has a 200 Mbps internet connection that is also used by the business, and the migration must complete within a few weeks. What is the appropriate approach?",
    options: [
      { id: "A", text: "Order AWS Snowball Edge devices, load the data locally, and ship them to AWS." },
      { id: "B", text: "Use AWS DataSync over the existing internet connection." },
      { id: "C", text: "Use the S3 multipart upload API with Transfer Acceleration enabled." },
      { id: "D", text: "Set up AWS Direct Connect and copy the data over it." }
    ],
    correct: ["A"],
    explanation:
      "At 200 Mbps, and sharing that link with the business, 600 TB would take many months — the arithmetic rules out any online transfer. Snowball Edge is the offline path: load locally at LAN speed, ship the devices, and AWS imports the data into S3, which fits a few-week window.",
    whyWrong: {
      B: "DataSync is an excellent online transfer service, but it is still bounded by the same 200 Mbps link and would take far too long.",
      C: "Transfer Acceleration improves long-distance throughput to S3 but cannot exceed the site's own upload bandwidth.",
      D: "Provisioning Direct Connect typically takes weeks to months before any data moves, so it does not meet the deadline for a one-time migration."
    }
  },

  {
    id: "perf-013",
    domain: "Design High-Performing Architectures",
    topic: "CloudFront and content delivery",
    difficulty: "hard",
    type: "single",
    question:
      "A site serves the same product pages to everyone but appends a unique tracking query string per visitor. Cache hit ratio at CloudFront is close to zero and the origin is overloaded. What should the architect change?",
    options: [
      { id: "A", text: "Use a cache policy that excludes the tracking query string from the cache key, forwarding it to the origin only if needed." },
      { id: "B", text: "Increase the distribution's default TTL to 24 hours." },
      { id: "C", text: "Add more origin servers behind the load balancer." },
      { id: "D", text: "Disable caching for the pages and rely on origin capacity." }
    ],
    correct: ["A"],
    explanation:
      "Anything included in the cache key creates a separate cache entry, so a per-visitor query string guarantees a miss for every visitor. Removing it from the cache key means all visitors share one cached object, which is what lifts the hit ratio and relieves the origin.",
    whyWrong: {
      B: "A longer TTL does not help when every request generates a distinct cache key — the object is never reused regardless of how long it is kept.",
      C: "More origin capacity absorbs the load rather than fixing the cause, at ongoing cost.",
      D: "Disabling caching sends every request to the origin, making the overload worse."
    }
  },

  {
    id: "cost-009",
    domain: "Design Cost-Optimized Architectures",
    topic: "Database cost optimization",
    difficulty: "medium",
    type: "single",
    question:
      "A development Aurora PostgreSQL cluster is provisioned for peak load but is idle overnight and at weekends, and its usage during the day is unpredictable. The team wants capacity to follow demand automatically without managing instance classes. What should they use?",
    options: [
      { id: "A", text: "Aurora Serverless v2, with a low minimum and a suitable maximum capacity." },
      { id: "B", text: "A smaller provisioned instance class with a read replica for peaks." },
      { id: "C", text: "Reserved Instances covering the current provisioned capacity." },
      { id: "D", text: "Aurora with storage auto-scaling enabled." }
    ],
    correct: ["A"],
    explanation:
      "Aurora Serverless v2 scales capacity in fine-grained increments in response to load, so an unpredictable daytime workload is met without over-provisioning and idle periods scale down to the configured minimum. That matches the described pattern far better than sizing for peak.",
    whyWrong: {
      B: "This still runs fixed capacity around the clock and adds a replica, increasing cost rather than following demand.",
      C: "Reserved Instances commit to paying for capacity continuously, which is the worst fit for a workload that is idle most of the week.",
      D: "Storage auto-scaling grows the storage layer as data grows; it has no effect on compute capacity or its cost."
    }
  },

  {
    id: "cost-010",
    domain: "Design Cost-Optimized Architectures",
    topic: "Cost allocation tags and budgets",
    difficulty: "easy",
    type: "single",
    question:
      "A finance team must attribute AWS spend to each of eight product teams sharing one account, and be alerted when any team's monthly spend exceeds its allocation. What should the architect set up?",
    options: [
      { id: "A", text: "A consistent cost allocation tag activated in the Billing console, with an AWS Budget filtered by that tag value per team." },
      { id: "B", text: "A separate AWS account per team, with consolidated billing." },
      { id: "C", text: "AWS Cost Explorer reports reviewed manually at month end." },
      { id: "D", text: "AWS Compute Optimizer recommendations grouped by resource owner." }
    ],
    correct: ["A"],
    explanation:
      "Cost allocation tags are the mechanism for splitting spend within an account, but they only appear in cost reports once activated in the Billing console. AWS Budgets can then be filtered by tag value, giving each team its own budget with threshold alerts.",
    whyWrong: {
      B: "Separate accounts are a clean way to divide spend and often the better long-term answer, but it is a substantial re-architecture rather than a reporting change, and the question keeps the shared account.",
      C: "Cost Explorer shows the spend but a manual month-end review provides no alerting when a team goes over.",
      D: "Compute Optimizer recommends right-sizing; it does not attribute spend to teams or alert on budgets."
    }
  },

  {
    id: "cost-011",
    domain: "Design Cost-Optimized Architectures",
    topic: "Elastic scaling to match demand",
    difficulty: "medium",
    type: "single",
    question:
      "A retail application's traffic follows a highly predictable daily curve: near zero from 01:00 to 06:00, climbing sharply from 08:00, and peaking every weekday between 12:00 and 14:00. The fleet is currently fixed at peak size. Which approach cuts cost while keeping the peak covered?",
    options: [
      { id: "A", text: "Scheduled scaling to set capacity ahead of the known daily pattern, combined with target tracking to handle variation around it." },
      { id: "B", text: "Target tracking scaling alone, with a low CPU target." },
      { id: "C", text: "Manual resizing of the Auto Scaling group each morning and evening." },
      { id: "D", text: "Purchasing Reserved Instances for the full peak fleet size." }
    ],
    correct: ["A"],
    explanation:
      "When demand is predictable, scheduled scaling puts capacity in place before it is needed rather than reacting after metrics rise, which avoids the lag inherent in reactive scaling. Layering target tracking on top absorbs day-to-day variation, so the two together cover the peak without paying for it overnight.",
    whyWrong: {
      B: "Target tracking alone reacts only after load has already increased, so the sharp 08:00 climb is met late; a low target also keeps excess capacity running.",
      C: "Manual resizing is toil, does not happen reliably, and cannot respond if the pattern shifts.",
      D: "Reservations reduce the rate paid but still commit to peak capacity 24 hours a day, so the idle overnight capacity is still bought."
    }
  },

  /* ==========================================================
   * Batch 3 — written against the concept mix in the practice
   * material: containers, serverless, analytics, migration,
   * DynamoDB and monitoring were heavily represented there and
   * thin here.
   * ========================================================== */

  {
    id: "sec-018",
    domain: "Design Secure Architectures",
    topic: "S3 access controls and Block Public Access",
    difficulty: "medium",
    type: "single",
    question:
      "A media company stores private videos in Amazon S3. Paying customers must be able to download a specific video directly from S3 for up to 15 minutes after they click a link, without the bucket being public and without the company proxying the file through its own servers. What should the architect implement?",
    options: [
      { id: "A", text: "Generate a presigned URL for the object with a 15-minute expiry, created by a backend role that can read the object." },
      { id: "B", text: "Add a bucket policy allowing s3:GetObject to everyone, with a condition on the customer's IP address." },
      { id: "C", text: "Give each paying customer an IAM user with read access to the bucket." },
      { id: "D", text: "Turn off Block Public Access and rely on obscure object key names." }
    ],
    correct: ["A"],
    explanation:
      "A presigned URL carries a time-limited signature created with the credentials of a principal that already has access. The object stays private, the link stops working when it expires, and the download goes straight from S3 to the customer without touching the company's servers.",
    whyWrong: {
      B: "This makes the object public to anyone who learns the URL, and IP conditions break for mobile users and shared networks.",
      C: "IAM users are for workloads and staff, not application end users; provisioning one per customer does not scale and hands out long-lived credentials.",
      D: "Unlisted object names are not access control — anyone who obtains the URL keeps access indefinitely."
    }
  },

  {
    id: "sec-019",
    domain: "Design Secure Architectures",
    topic: "VPC endpoints and private connectivity",
    difficulty: "hard",
    type: "single",
    question:
      "A company uses a gateway VPC endpoint so private instances can reach Amazon S3. Auditors now require that instances in this VPC can only reach the company's own buckets, and cannot copy data to any bucket outside the organization. What should the architect configure?",
    options: [
      { id: "A", text: "A VPC endpoint policy restricting access to the specific bucket ARNs, plus a condition on aws:PrincipalOrgID." },
      { id: "B", text: "A security group on the gateway endpoint allowing only the S3 prefix list." },
      { id: "C", text: "A network ACL denying outbound traffic to the S3 service prefix list except for the company's buckets." },
      { id: "D", text: "An IAM policy on each instance role allowing s3:PutObject only on company buckets." }
    ],
    correct: ["A"],
    explanation:
      "An endpoint policy is a resource policy on the endpoint itself, evaluated for every request that passes through it, so it can restrict which buckets are reachable regardless of what the instance's own IAM policy permits. Adding an organization condition prevents copying data into buckets outside the organization.",
    whyWrong: {
      B: "Gateway endpoints are route-table constructs and do not have security groups; only interface endpoints do.",
      C: "Network ACLs filter by IP ranges, and the S3 prefix list covers all buckets in the Region indiscriminately — it cannot distinguish one bucket from another.",
      D: "An IAM policy is a strong control but applies only to that role; anyone who launches an instance with a different role bypasses it, whereas the endpoint policy covers everything using the endpoint."
    }
  },

  {
    id: "sec-020",
    domain: "Design Secure Architectures",
    topic: "Auditing with CloudTrail and Config",
    difficulty: "medium",
    type: "single",
    question:
      "A security team must retain an immutable record of API activity for all 30 accounts in an organization, stored centrally, and must be certain that no member account can turn logging off or alter past logs. What should be configured?",
    options: [
      { id: "A", text: "An organization trail created in the management account, delivering to a central S3 bucket with Object Lock enabled." },
      { id: "B", text: "A separate CloudTrail trail in each account, each delivering to its own bucket with versioning enabled." },
      { id: "C", text: "CloudWatch Logs subscriptions in each account forwarding to a central log group." },
      { id: "D", text: "AWS Config aggregators collecting configuration items into the management account." }
    ],
    correct: ["A"],
    explanation:
      "An organization trail is created once in the management account and automatically applies to every member account, including accounts added later; member accounts cannot modify or delete it. Delivering to a central bucket with S3 Object Lock makes the delivered logs immutable for their retention period.",
    whyWrong: {
      B: "Per-account trails can be stopped or reconfigured by that account's administrators, which is exactly the risk the requirement addresses.",
      C: "Subscriptions move log data but do not create the trail, do not cover accounts uniformly, and provide no immutability.",
      D: "Config records resource configuration, not API activity, and an aggregator is read-only reporting rather than an immutable audit trail."
    }
  },

  {
    id: "sec-021",
    domain: "Design Secure Architectures",
    topic: "Threat detection with GuardDuty and Security Hub",
    difficulty: "medium",
    type: "single",
    question:
      "A company must discover whether any of its several thousand S3 buckets contain customer credit card numbers or national identity numbers, and be alerted when new sensitive data appears. What should the architect use?",
    options: [
      { id: "A", text: "Amazon Macie, with sensitive data discovery jobs across the buckets." },
      { id: "B", text: "Amazon GuardDuty with S3 protection enabled." },
      { id: "C", text: "AWS Config rules checking bucket encryption and public access settings." },
      { id: "D", text: "Amazon Inspector scanning the buckets for vulnerabilities." }
    ],
    correct: ["A"],
    explanation:
      "Macie is the service that inspects S3 object content and classifies sensitive data such as payment card numbers and national identifiers, using managed data identifiers, and reports findings as data is discovered.",
    whyWrong: {
      B: "GuardDuty S3 protection detects suspicious access patterns and API activity against buckets; it does not inspect object contents for sensitive data.",
      C: "Config evaluates bucket configuration such as encryption and public access. It never looks inside the objects.",
      D: "Inspector assesses workloads such as EC2 instances, containers and Lambda for software vulnerabilities, not S3 object content."
    }
  },

  {
    id: "sec-022",
    domain: "Design Secure Architectures",
    topic: "IAM policy evaluation",
    difficulty: "medium",
    type: "single",
    question:
      "A policy grants a group permission to terminate EC2 instances, but the security team requires that terminations only succeed when the caller authenticated with multi-factor authentication. What is the correct way to express this?",
    options: [
      { id: "A", text: "Add a condition to the policy requiring aws:MultiFactorAuthPresent to be true." },
      { id: "B", text: "Enable MFA on the root user of the account." },
      { id: "C", text: "Attach an SCP that denies ec2:TerminateInstances outright." },
      { id: "D", text: "Require MFA at the identity provider and rely on session length." }
    ],
    correct: ["A"],
    explanation:
      "IAM condition keys evaluate properties of the request. Requiring aws:MultiFactorAuthPresent means the TerminateInstances call is only authorised when the caller's session was established with MFA, which is precisely the stated control.",
    whyWrong: {
      B: "Root MFA protects the root user only and has no bearing on what other principals may do.",
      C: "A blanket deny removes the ability entirely rather than conditioning it on MFA.",
      D: "Enforcing MFA at the identity provider does not make AWS aware of it per request unless the condition key is checked; the session could also outlive the intent."
    }
  },

  {
    id: "sec-023",
    domain: "Design Secure Architectures",
    topic: "Certificate management and encryption in transit",
    difficulty: "easy",
    type: "single",
    question:
      "Several web applications, each with its own fully qualified domain name, run behind Application Load Balancers. They must present publicly trusted TLS certificates, and the company wants the least ongoing operational effort. What should the architect do?",
    options: [
      { id: "A", text: "Request public certificates from AWS Certificate Manager and attach them to the HTTPS listeners." },
      { id: "B", text: "Run a private certificate authority on EC2 and issue certificates with a certbot job." },
      { id: "C", text: "Generate self-signed certificates with OpenSSL and import them into ACM." },
      { id: "D", text: "Issue certificates from AWS Private Certificate Authority and attach them to the listeners." }
    ],
    correct: ["A"],
    explanation:
      "ACM public certificates are free, trusted by browsers out of the box, and renew automatically while DNS validation remains in place. Attaching them to the load balancer listener is the whole task, which is the lowest possible ongoing effort.",
    whyWrong: {
      B: "Running your own CA means operating servers, renewing certificates and distributing trust — the highest operational burden of the options.",
      C: "Self-signed certificates are not publicly trusted, so browsers will warn users regardless of where the certificate is stored.",
      D: "AWS Private CA issues certificates trusted only inside your organisation, and it carries a significant monthly charge. It is for internal workloads, not public websites."
    }
  },

  {
    id: "res-016",
    domain: "Design Resilient Architectures",
    topic: "RDS Multi-AZ vs read replicas",
    difficulty: "medium",
    type: "multi",
    question:
      "A registration platform runs on Amazon ECS with an Amazon RDS Multi-AZ database. The team is documenting which conditions cause RDS to fail over to the standby automatically. Which TWO of the following trigger an automatic failover?",
    options: [
      { id: "A", text: "Loss of availability in the primary Availability Zone." },
      { id: "B", text: "Storage failure on the primary database instance." },
      { id: "C", text: "Compute unit failure on the standby database instance." },
      { id: "D", text: "Failure of a read replica in another Region." },
      { id: "E", text: "Storage failure on the standby database instance." }
    ],
    correct: ["A", "B"],
    explanation:
      "Multi-AZ failover is triggered by conditions that make the primary unable to serve the workload — losing the primary's Availability Zone, losing network connectivity to the primary, a compute failure on the primary, or a storage failure on the primary. The standby is promoted and the DNS endpoint is repointed.",
    whyWrong: {
      C: "A problem on the standby does not affect the primary, which is still serving traffic; AWS repairs or replaces the standby instead.",
      D: "Read replicas are a separate feature for scaling reads. Their failure has no bearing on the Multi-AZ pair.",
      E: "As with a standby compute failure, a storage problem on the standby does not interrupt the primary and so does not cause failover."
    }
  },

  {
    id: "res-017",
    domain: "Design Resilient Architectures",
    topic: "Monitoring and alarms with CloudWatch",
    difficulty: "medium",
    type: "single",
    question:
      "An application writes errors to CloudWatch Logs. The operations team needs to be paged when the phrase \"OutOfMemoryError\" appears more than five times in any five-minute window. What is the correct configuration?",
    options: [
      { id: "A", text: "A metric filter on the log group that increments a custom metric, with a CloudWatch alarm on that metric publishing to an SNS topic." },
      { id: "B", text: "A CloudWatch alarm applied directly to the log group's text content." },
      { id: "C", text: "A CloudWatch Logs subscription filter delivering to Amazon S3, with Athena queried on a schedule." },
      { id: "D", text: "A CloudWatch dashboard widget showing the log group, reviewed by the team." }
    ],
    correct: ["A"],
    explanation:
      "Alarms act on metrics, not on raw log text. A metric filter scans incoming log events for the pattern and publishes a numeric metric, and an alarm on that metric with a five-minute period and a threshold of five sends a notification through SNS.",
    whyWrong: {
      B: "CloudWatch alarms cannot be attached to log text directly; a metric must exist first.",
      C: "This builds a slow batch pipeline for something that should notify in near real time, and adds storage and query cost.",
      D: "A dashboard requires a human to be looking. It is not alerting."
    }
  },

  {
    id: "res-018",
    domain: "Design Resilient Architectures",
    topic: "Load balancer selection",
    difficulty: "medium",
    type: "single",
    question:
      "A game backend runs containerised servers on AWS Fargate and must load balance incoming TCP traffic at the transport layer, sustaining millions of requests per second at very low latency for players worldwide. What should be placed in front of the tasks?",
    options: [
      { id: "A", text: "A Network Load Balancer." },
      { id: "B", text: "An Application Load Balancer." },
      { id: "C", text: "A custom load-balancing microservice on Fargate, because ELB cannot target Fargate tasks." },
      { id: "D", text: "Route 53 weighted records pointing at each task's IP address." }
    ],
    correct: ["A"],
    explanation:
      "The requirement is explicitly layer 4 TCP at very high throughput and low latency, which is what the Network Load Balancer is built for. NLBs support IP-mode target groups, which is how Fargate tasks are registered.",
    whyWrong: {
      B: "An ALB works at layer 7 for HTTP and HTTPS. It adds request parsing the workload does not need and does not target the stated performance profile.",
      C: "Both ALB and NLB support Fargate through IP target groups, so building a custom balancer solves a problem that does not exist.",
      D: "Route 53 distributes by DNS responses with no health-aware connection handling at this scale, and task IP addresses change constantly."
    }
  },

  {
    id: "res-019",
    domain: "Design Resilient Architectures",
    topic: "Event-driven patterns with EventBridge",
    difficulty: "medium",
    type: "single",
    question:
      "GPS files land in an S3 bucket continuously. Each file needs roughly three minutes of processing and 128 MB of memory, and processing must begin as soon as a file arrives. Occasional processing failures must not lose the file. What is the most appropriate design?",
    options: [
      { id: "A", text: "An S3 event notification to an SQS queue, with a Lambda function consuming the queue and a dead-letter queue for repeated failures." },
      { id: "B", text: "An S3 event notification to an SNS topic with an EC2 Auto Scaling group subscribed by HTTP." },
      { id: "C", text: "A scheduled Lambda function that lists the bucket every five minutes and processes new objects." },
      { id: "D", text: "An S3 event notification to a Kinesis data stream, with an EC2 Spot Fleet polling the stream nightly." }
    ],
    correct: ["A"],
    explanation:
      "Three minutes and 128 MB sit comfortably within Lambda's limits, so serverless processing fits. Putting a queue between the bucket and the function buffers bursts, gives automatic retries, and a dead-letter queue captures anything that fails repeatedly rather than losing it.",
    whyWrong: {
      B: "SNS pushes to endpoints with no durable buffer for slow consumers, and instances would be running and billed continuously between files.",
      C: "Polling adds up to five minutes of latency and repeatedly lists a growing bucket, which is both slower and more expensive than event-driven delivery.",
      D: "A nightly batch contradicts the requirement to process files as they arrive, and Kinesis suits high-volume record streams rather than per-file processing."
    }
  },

  {
    id: "res-020",
    domain: "Design Resilient Architectures",
    topic: "Backup and restore with AWS Backup",
    difficulty: "medium",
    type: "single",
    question:
      "An operations team accidentally ran a script that corrupted rows in a DynamoDB table at approximately 14:20. They need the table restored to its exact state just before that moment, and the table had continuous backups enabled. What should they do?",
    options: [
      { id: "A", text: "Use DynamoDB point-in-time recovery to restore the table to a timestamp just before 14:20, into a new table." },
      { id: "B", text: "Restore the most recent on-demand backup, which is taken nightly." },
      { id: "C", text: "Replay DynamoDB Streams records from the last 24 hours in reverse." },
      { id: "D", text: "Enable a global table in a second Region and fail over to it." }
    ],
    correct: ["A"],
    explanation:
      "Point-in-time recovery keeps continuous backups covering the last 35 days and can restore to any second within that window, which is exactly what recovering to just before 14:20 requires. Restores always create a new table, so the corrupted one remains available for comparison.",
    whyWrong: {
      B: "A nightly backup loses everything written since the snapshot, which is far more data loss than necessary when PITR is available.",
      C: "Streams retain records for 24 hours and are not a restore mechanism; reversing writes by hand is error-prone and does not reconstruct deleted state reliably.",
      D: "Global tables replicate changes, so the corruption would already have propagated to the other Region."
    }
  },

  {
    id: "perf-014",
    domain: "Design High-Performing Architectures",
    topic: "Containers on ECS, EKS and Fargate",
    difficulty: "medium",
    type: "single",
    question:
      "A team is moving a containerised web API to AWS. They have no need to tune the operating system, want no EC2 instances to patch or scale, and want to pay only for the vCPU and memory their tasks request. Which option fits?",
    options: [
      { id: "A", text: "Amazon ECS with the AWS Fargate launch type." },
      { id: "B", text: "Amazon ECS with the EC2 launch type using a managed capacity provider." },
      { id: "C", text: "Amazon EKS with self-managed EC2 node groups." },
      { id: "D", text: "Containers on EC2 instances managed by an Auto Scaling group and Docker Compose." }
    ],
    correct: ["A"],
    explanation:
      "Fargate is the serverless compute engine for containers: there are no instances to provision, patch or scale, and billing is per vCPU-second and GB-second of the resources each task requests. That maps directly onto every stated requirement.",
    whyWrong: {
      B: "The EC2 launch type means you own the instances, including patching and capacity, even when a capacity provider automates scaling.",
      C: "Self-managed node groups add both EC2 management and Kubernetes control-plane concepts the team has not asked for.",
      D: "This is the most operational effort of all — instance fleet, container runtime and orchestration all managed by the team."
    }
  },

  {
    id: "perf-015",
    domain: "Design High-Performing Architectures",
    topic: "Serverless compute with Lambda",
    difficulty: "medium",
    type: "single",
    question:
      "A nightly job currently runs on an EC2 Spot Fleet, takes about three minutes per file and needs 64 MB of memory. The company wants to process each file the moment it is uploaded to S3, in the most cost-effective way. What should replace the Spot Fleet?",
    options: [
      { id: "A", text: "An AWS Lambda function triggered by S3 event notifications." },
      { id: "B", text: "An ECS on EC2 service polling the bucket every minute." },
      { id: "C", text: "An EMR cluster started by an EventBridge schedule." },
      { id: "D", text: "An Auto Scaling group of t3.micro instances kept warm for uploads." }
    ],
    correct: ["A"],
    explanation:
      "The workload is short, small and event-driven — three minutes is well inside Lambda's 15-minute limit and 64 MB is below its minimum memory allocation. Lambda runs only when a file arrives and bills per millisecond, so idle time costs nothing at all.",
    whyWrong: {
      B: "A polling service runs and bills continuously, and adds up to a minute of latency for something that should start on arrival.",
      C: "EMR is a cluster for large-scale distributed data processing; spinning one up per file would be dramatically more expensive and slower to start.",
      D: "Keeping instances warm means paying around the clock for a job that runs a few minutes at a time."
    }
  },

  {
    id: "perf-016",
    domain: "Design High-Performing Architectures",
    topic: "Analytics with Athena and Redshift",
    difficulty: "hard",
    type: "single",
    question:
      "A business intelligence team runs complex joins across billions of rows, all day, from a dashboard used by 200 analysts who expect consistent sub-second response. The data is currently in S3. Which service is the better fit?",
    options: [
      { id: "A", text: "Amazon Redshift, loading the data into the cluster and using its columnar storage and result caching." },
      { id: "B", text: "Amazon Athena querying the S3 data directly." },
      { id: "C", text: "Amazon RDS for PostgreSQL with a large instance class." },
      { id: "D", text: "Amazon DynamoDB with a global secondary index for each dashboard query." }
    ],
    correct: ["A"],
    explanation:
      "Redshift is a data warehouse built for sustained, concurrent, complex analytical queries over very large datasets, with columnar storage, compiled query plans and result caching that deliver consistent low latency for many simultaneous users.",
    whyWrong: {
      B: "Athena is superb for occasional ad-hoc queries with no infrastructure, but per-query scanning and variable latency make it a poor fit for 200 users expecting sub-second dashboards all day.",
      C: "A relational OLTP engine is not designed for analytical joins across billions of rows, regardless of instance size.",
      D: "DynamoDB serves known key-based access patterns at scale; it cannot perform ad-hoc analytical joins."
    }
  },

  {
    id: "perf-017",
    domain: "Design High-Performing Architectures",
    topic: "DynamoDB performance and caching",
    difficulty: "medium",
    type: "single",
    question:
      "A DynamoDB table is throttling reads. Investigation shows that 90 percent of requests target a single partition key representing one very popular product, while overall table capacity is barely used. What is the correct remedy?",
    options: [
      { id: "A", text: "Put DynamoDB Accelerator in front of the table so repeated reads of the hot item are served from cache." },
      { id: "B", text: "Increase the table's provisioned read capacity units substantially." },
      { id: "C", text: "Add a local secondary index on the popular attribute." },
      { id: "D", text: "Switch the table to eventually consistent reads only." }
    ],
    correct: ["A"],
    explanation:
      "This is a hot partition: capacity is spread across partitions, so raising table-wide capacity does not fix concentration on one key. A cache in front of the table absorbs the repeated reads of that item, and DAX is purpose-built for DynamoDB with microsecond reads and no application rewrite.",
    whyWrong: {
      B: "Extra capacity is distributed across partitions, so the hot partition still saturates while you pay for unused capacity everywhere else.",
      C: "An LSI provides an alternative sort key within the same partition — it does not spread or reduce load on a hot key.",
      D: "Eventually consistent reads halve the capacity cost per read, which softens the symptom slightly but leaves the concentration on one partition intact."
    }
  },

  {
    id: "perf-018",
    domain: "Design High-Performing Architectures",
    topic: "Data transfer and migration services",
    difficulty: "medium",
    type: "single",
    question:
      "An on-premises application must keep writing to an NFS share, but the company wants that data continuously available as objects in Amazon S3 without changing the application. What should the architect deploy?",
    options: [
      { id: "A", text: "AWS Storage Gateway in File Gateway mode, presenting an NFS share backed by S3." },
      { id: "B", text: "AWS DataSync running a nightly transfer task." },
      { id: "C", text: "An AWS Snowball Edge device shipped monthly." },
      { id: "D", text: "Amazon EFS mounted over a VPN from on-premises." }
    ],
    correct: ["A"],
    explanation:
      "File Gateway gives on-premises applications a standard NFS or SMB mount while storing the data as objects in S3, with a local cache for recently used files. The application keeps writing to a file share unchanged and the data appears in S3.",
    whyWrong: {
      B: "DataSync is excellent for scheduled or one-off transfers, but a nightly task is not continuous availability and the source remains the authoritative store.",
      C: "Snowball is for bulk offline migration, not for ongoing file access.",
      D: "EFS over VPN keeps the data in EFS rather than S3, and adds latency to every file operation without meeting the object-storage requirement."
    }
  },

  {
    id: "cost-012",
    domain: "Design Cost-Optimized Architectures",
    topic: "EBS snapshot and volume cost",
    difficulty: "medium",
    type: "single",
    question:
      "A cost review finds a large and growing spend on unused EBS volumes and old snapshots. The company wants the problem fixed and prevented from recurring, with the least ongoing operational overhead. What should they do?",
    options: [
      { id: "A", text: "Delete the expired and unused snapshots and volumes, then use Amazon Data Lifecycle Manager to create and expire snapshots on a policy." },
      { id: "B", text: "Delete all expired and unused snapshots using a scheduled AWS CLI script." },
      { id: "C", text: "Write a custom CDK application that monitors disk usage and shrinks volumes with Elastic Volumes." },
      { id: "D", text: "Review CloudWatch metrics monthly and resize volumes by hand." }
    ],
    correct: ["A"],
    explanation:
      "Deleting the existing waste addresses today's bill, and Data Lifecycle Manager prevents recurrence by managing snapshot creation and expiry on a schedule you define — a managed feature rather than code the team must maintain.",
    whyWrong: {
      B: "A CLI script is a one-off clean-up unless someone maintains and schedules it, and it does nothing about newly created snapshots accumulating.",
      C: "This is substantial custom code to own, and EBS Elastic Volumes cannot shrink a volume — only grow it.",
      D: "Manual monthly review is exactly the ongoing overhead the requirement seeks to avoid, and it will lapse."
    }
  },

  {
    id: "cost-013",
    domain: "Design Cost-Optimized Architectures",
    topic: "Database cost optimization",
    difficulty: "medium",
    type: "single",
    question:
      "A retail website is migrating to AWS. Its transactional workload is intermittent, sporadic and genuinely unpredictable through the day. The company needs a relational database that scales up for surges and back down afterwards, at the lowest cost. What should be deployed?",
    options: [
      { id: "A", text: "An Amazon Aurora Serverless cluster with a configured minimum and maximum capacity." },
      { id: "B", text: "An Aurora provisioned cluster using burstable instance classes." },
      { id: "C", text: "An Amazon Redshift cluster with concurrency scaling." },
      { id: "D", text: "A DynamoDB global table with auto scaling." }
    ],
    correct: ["A"],
    explanation:
      "Aurora Serverless adjusts database capacity automatically in response to load and scales back down when the surge passes, so an unpredictable workload does not require provisioning for peak. Setting a capacity range bounds both performance and spend.",
    whyWrong: {
      B: "Burstable instances rely on CPU credits and still run continuously at a fixed size; sustained surges exhaust credits and idle periods still cost money.",
      C: "Redshift is an analytics warehouse, not a transactional database.",
      D: "DynamoDB is non-relational, and a global table adds cross-Region replication cost that the scenario does not call for."
    }
  },

  {
    id: "cost-014",
    domain: "Design Cost-Optimized Architectures",
    topic: "Serverless vs container cost",
    difficulty: "medium",
    type: "single",
    question:
      "A batch process runs for about four hours every night, is fully fault tolerant, and can be stopped and resumed from a checkpoint at any point. The team wants the lowest possible compute cost. What should they run it on?",
    options: [
      { id: "A", text: "EC2 Spot Instances, with the job checkpointing so it can resume after an interruption." },
      { id: "B", text: "EC2 On-Demand Instances started and stopped by a schedule." },
      { id: "C", text: "AWS Lambda functions invoked in parallel." },
      { id: "D", text: "Three-year Standard Reserved Instances sized for the job." }
    ],
    correct: ["A"],
    explanation:
      "Spot capacity offers the steepest discount off On-Demand and is intended precisely for interruption-tolerant work. A job that checkpoints and resumes loses nothing when an instance is reclaimed, so the discount comes at no practical cost.",
    whyWrong: {
      B: "On-Demand with a schedule avoids idle charges but pays full rate for every hour the job runs.",
      C: "Lambda caps a single invocation at 15 minutes, so a four-hour batch does not fit without substantial re-architecture.",
      D: "A three-year commitment for four hours a night pays for roughly 20 hours of idle capacity every day."
    }
  },

  {
    id: "cost-015",
    domain: "Design Cost-Optimized Architectures",
    topic: "S3 storage class selection",
    difficulty: "medium",
    type: "single",
    question:
      "Log files are written to S3 and read heavily for the first week, occasionally during the following month, and then effectively never — though compliance requires keeping them for five years and they must be retrievable within 12 hours if an auditor asks. Which lifecycle configuration is cheapest?",
    options: [
      { id: "A", text: "Standard for 7 days, Standard-IA to day 37, then Glacier Deep Archive until expiry at 5 years." },
      { id: "B", text: "Standard for 7 days, then Glacier Instant Retrieval for the remaining 5 years." },
      { id: "C", text: "Intelligent-Tiering for the full 5 years." },
      { id: "D", text: "Standard-IA immediately, then Glacier Flexible Retrieval after 37 days." }
    ],
    correct: ["A"],
    explanation:
      "The lifecycle should follow the access pattern. Standard covers the hot first week, Standard-IA suits the occasional access over the following month, and Deep Archive — the cheapest storage class — fits data that is effectively never read, since its standard retrieval completes within 12 hours.",
    whyWrong: {
      B: "Glacier Instant Retrieval costs considerably more than Deep Archive and buys millisecond retrieval that the 12-hour tolerance makes unnecessary.",
      C: "Intelligent-Tiering charges a monitoring fee per object for five years to solve unpredictability that does not exist here — this access pattern is entirely predictable.",
      D: "Moving to Standard-IA on day one incurs retrieval charges during the heavy first week, and Flexible Retrieval is more expensive than Deep Archive for the long tail."
    }
  },

  /* ==========================================================
   * Batch 4 — depth on the subjects the practice material
   * hammers hardest: IAM, Auto Scaling/ELB, RDS/Aurora, VPC,
   * storage selection and cost levers.
   * ========================================================== */

  {
    id: "sec-024",
    domain: "Design Secure Architectures",
    topic: "Cross-account access with IAM roles",
    difficulty: "hard",
    type: "single",
    question:
      "A company hires a third-party monitoring vendor that needs read-only access to its AWS account. The vendor serves many customers and will assume a role in each. What must the architect require in the role's trust policy to protect against the confused deputy problem?",
    options: [
      { id: "A", text: "A condition requiring a unique sts:ExternalId value agreed with the vendor." },
      { id: "B", text: "A condition restricting the vendor's source IP address range." },
      { id: "C", text: "An IAM user for the vendor with an access key rotated every 30 days." },
      { id: "D", text: "A permissions boundary on the role limiting it to read-only actions." }
    ],
    correct: ["A"],
    explanation:
      "The confused deputy risk is that the vendor, holding the ability to assume roles in many customer accounts, could be tricked into using one customer's role identifier on another customer's behalf. An external ID is a secret shared only between you and the vendor, and requiring it in the trust policy means the vendor must present your specific value to assume your role.",
    whyWrong: {
      B: "IP conditions are brittle for a SaaS vendor whose egress addresses change, and they do not address the confused deputy scenario at all.",
      C: "An IAM user reintroduces long-lived credentials for an external party, which is exactly what role assumption avoids.",
      D: "A boundary limits what the role can do once assumed — useful, but it does not control who can assume it or prevent misuse on another customer's behalf."
    }
  },

  {
    id: "sec-025",
    domain: "Design Secure Architectures",
    topic: "Security groups vs NACLs",
    difficulty: "medium",
    type: "single",
    question:
      "A single external IP address is repeatedly probing an application in a public subnet. The team needs to block that one address for the whole subnet while leaving all other traffic unchanged. What should they use?",
    options: [
      { id: "A", text: "A network ACL rule denying traffic from that IP address, with a rule number lower than the allow rules." },
      { id: "B", text: "A security group rule denying traffic from that IP address." },
      { id: "C", text: "Removing the allow-all inbound rule from the instances' security group." },
      { id: "D", text: "A route table entry sending that IP's traffic to a blackhole target." }
    ],
    correct: ["A"],
    explanation:
      "Security groups only express allow rules, so blocking one specific source requires a network ACL, which supports deny and applies at the subnet boundary. NACL rules are evaluated in ascending rule-number order and the first match wins, so the deny must be numbered below the allow rules that would otherwise permit the traffic.",
    whyWrong: {
      B: "Security groups have no deny rules — there is no way to express \"everyone except this address\" in one.",
      C: "This blocks all legitimate traffic as well, taking the application offline.",
      D: "Route tables direct outbound traffic by destination; they cannot filter inbound traffic by source address."
    }
  },

  {
    id: "sec-026",
    domain: "Design Secure Architectures",
    topic: "S3 encryption options",
    difficulty: "medium",
    type: "single",
    question:
      "A compliance rule states that every object written to a bucket must be encrypted with a specific KMS key, and any upload that is not must be rejected at write time rather than corrected later. What should the architect configure?",
    options: [
      { id: "A", text: "A bucket policy denying s3:PutObject when s3:x-amz-server-side-encryption-aws-kms-key-id does not match the required key ARN." },
      { id: "B", text: "Default bucket encryption set to that KMS key, with no bucket policy." },
      { id: "C", text: "An S3 Batch Operations job that re-encrypts objects nightly." },
      { id: "D", text: "An AWS Config rule that flags objects encrypted with the wrong key." }
    ],
    correct: ["A"],
    explanation:
      "Only a bucket policy can reject a request as it is made. Denying PutObject unless the request specifies the required KMS key ARN causes non-compliant uploads to fail with access denied, which is the stated requirement of rejection at write time.",
    whyWrong: {
      B: "Default encryption silently applies the key when the caller specifies none, but a caller who explicitly requests a different key still succeeds — nothing is rejected.",
      C: "Nightly re-encryption is correction after the fact, leaving a window where objects sit encrypted incorrectly.",
      D: "Config evaluates and reports; it does not block the write, and it does not track individual S3 objects."
    }
  },

  {
    id: "sec-027",
    domain: "Design Secure Architectures",
    topic: "Edge protection with WAF and Shield",
    difficulty: "medium",
    type: "single",
    question:
      "A login endpoint is being hit with credential-stuffing attempts from a large, constantly changing set of IP addresses. Legitimate users must not be blocked. What is the most appropriate control?",
    options: [
      { id: "A", text: "An AWS WAF rate-based rule on the login URI that blocks source IPs exceeding a request threshold in a five-minute window." },
      { id: "B", text: "An AWS WAF IP set blocking the attacking addresses observed so far." },
      { id: "C", text: "A network ACL denying the attacking address ranges." },
      { id: "D", text: "Reducing the ALB idle timeout so attack connections are dropped sooner." }
    ],
    correct: ["A"],
    explanation:
      "A rate-based rule counts requests per source IP over a rolling window and blocks addresses that exceed the threshold, then releases them when the rate drops. Because it reacts to behaviour rather than to a fixed list, it copes with attackers rotating addresses while leaving normal users, who never approach the threshold, unaffected.",
    whyWrong: {
      B: "A static IP set is always behind an attacker who changes addresses, and it grows unmanageably.",
      C: "NACLs are stateless subnet filters with a limited rule count and no rate awareness; they cannot keep pace with a rotating source set.",
      D: "Idle timeout affects connection lifetime, not the volume of authentication attempts."
    }
  },

  {
    id: "sec-028",
    domain: "Design Secure Architectures",
    topic: "Secrets management and rotation",
    difficulty: "medium",
    type: "single",
    question:
      "An application needs about 400 configuration values — feature flags, endpoint URLs, timeouts — plus 3 database passwords that must rotate automatically. The team wants to minimise cost without losing rotation on the passwords. What should they do?",
    options: [
      { id: "A", text: "Keep the 400 configuration values as Systems Manager Parameter Store standard parameters and put the 3 passwords in AWS Secrets Manager with managed rotation." },
      { id: "B", text: "Put all 403 values in AWS Secrets Manager for a single consistent interface." },
      { id: "C", text: "Put all 403 values in Parameter Store and write a Lambda function to rotate the passwords." },
      { id: "D", text: "Store everything in an encrypted S3 object read at application start." }
    ],
    correct: ["A"],
    explanation:
      "Secrets Manager bills per secret per month, so storing 400 non-secret configuration values there is needless cost. Parameter Store standard parameters are free and well suited to configuration, while the three credentials that genuinely need managed rotation justify Secrets Manager.",
    whyWrong: {
      B: "This pays a per-secret charge 400 times over for values that are configuration, not secrets requiring rotation.",
      C: "It saves the Secrets Manager charge but hands the team rotation logic to build, test and own for a trivial saving on three secrets.",
      D: "A single object gives no per-value access control, no rotation, and requires a restart or custom refresh to pick up changes."
    }
  },

  {
    id: "sec-029",
    domain: "Design Secure Architectures",
    topic: "Identity federation and IAM Identity Center",
    difficulty: "medium",
    type: "single",
    question:
      "A company runs Active Directory on premises and wants staff to sign in to AWS with their existing AD credentials, without replicating the directory into AWS and without managing domain controllers in the cloud. Which approach fits?",
    options: [
      { id: "A", text: "Use AD Connector to proxy authentication to the on-premises directory, with IAM Identity Center assigning permission sets." },
      { id: "B", text: "Deploy AWS Managed Microsoft AD and establish a two-way trust with the on-premises forest." },
      { id: "C", text: "Create IAM users mirroring the AD user list and synchronise passwords with a scheduled script." },
      { id: "D", text: "Deploy self-managed domain controllers on EC2 instances replicating from on-premises." }
    ],
    correct: ["A"],
    explanation:
      "AD Connector is a directory gateway: it redirects authentication requests to the existing on-premises Active Directory without caching or replicating directory data, and without any domain controllers running in AWS. Identity Center then maps AD groups to permission sets.",
    whyWrong: {
      B: "Managed Microsoft AD is a genuine directory running in AWS, which is more than required and involves managing a trust relationship.",
      C: "Mirroring users as IAM users creates a second identity store with synchronised passwords — a security and operational liability.",
      D: "Self-managed domain controllers on EC2 is the highest-effort option and explicitly involves running directory infrastructure in the cloud."
    }
  },

  {
    id: "sec-030",
    domain: "Design Secure Architectures",
    topic: "IAM policy evaluation",
    difficulty: "hard",
    type: "single",
    question:
      "Objects uploaded to a shared bucket by several other accounts cannot be read by the bucket-owning account, even though its administrators have full S3 permissions. What is the cleanest fix going forward?",
    options: [
      { id: "A", text: "Set the bucket's Object Ownership to Bucket owner enforced, which disables ACLs and makes the bucket owner the owner of every object." },
      { id: "B", text: "Ask each uploading account to grant the bucket owner read access on every object with an ACL." },
      { id: "C", text: "Add s3:GetObject for the bucket owner to the bucket policy." },
      { id: "D", text: "Enable default encryption with SSE-KMS on the bucket." }
    ],
    correct: ["A"],
    explanation:
      "By default an object is owned by the account that uploaded it, and the bucket owner's own permissions do not automatically extend to another account's objects. Bucket owner enforced disables ACLs entirely and makes the bucket owner the owner of all objects, so bucket policies and IAM alone govern access.",
    whyWrong: {
      B: "Per-object ACLs work but depend on every uploader remembering to set them correctly on every upload — fragile, and AWS now recommends disabling ACLs.",
      C: "A bucket policy cannot grant the bucket owner rights over objects owned by another account; ownership is the blocker, not the policy.",
      D: "Encryption settings do not change object ownership, and an SSE-KMS key would add a second permission problem on top."
    }
  },

  {
    id: "res-021",
    domain: "Design Resilient Architectures",
    topic: "Auto Scaling and health checks",
    difficulty: "hard",
    type: "single",
    question:
      "Worker instances consume jobs from an SQS queue. Scaling on CPU responds poorly: the queue backs up long before CPU rises, and instances stay running after the queue drains. What scaling signal should the team use?",
    options: [
      { id: "A", text: "Target tracking on a custom metric of backlog per instance — queue depth divided by the number of in-service instances." },
      { id: "B", text: "Target tracking on the ALB request count per target." },
      { id: "C", text: "Simple scaling on the queue's ApproximateNumberOfMessagesVisible with a fixed threshold." },
      { id: "D", text: "Scheduled scaling based on the historical busiest hours." }
    ],
    correct: ["A"],
    explanation:
      "Backlog per instance expresses how much work each worker has waiting, which is the quantity the fleet size should track. Because the metric is normalised by fleet size, the same target holds whether there are 3 workers or 300, so the group scales out as the backlog grows and back in as it clears.",
    whyWrong: {
      B: "The workers are not behind a load balancer — they poll a queue — so request count per target is not a signal here.",
      C: "A raw queue depth threshold is not normalised: 1,000 messages means something very different for 3 workers than for 300, so the threshold is wrong at most fleet sizes.",
      D: "Scheduled scaling suits predictable patterns, but the problem described is responsiveness to actual backlog."
    }
  },

  {
    id: "res-022",
    domain: "Design Resilient Architectures",
    topic: "Route 53 routing policies",
    difficulty: "medium",
    type: "single",
    question:
      "A company wants visitors to see a static maintenance page hosted in Amazon S3 automatically whenever its primary application endpoint becomes unhealthy, and to return to the application when it recovers. What should be configured?",
    options: [
      { id: "A", text: "Route 53 failover routing with a health check on the primary record and the S3 website endpoint as the secondary record." },
      { id: "B", text: "Route 53 weighted routing with 99 percent to the application and 1 percent to the S3 site." },
      { id: "C", text: "A CloudFront distribution with the S3 bucket as a second origin and no origin group." },
      { id: "D", text: "Latency-based routing between the application endpoint and the S3 website endpoint." }
    ],
    correct: ["A"],
    explanation:
      "Failover routing is designed for exactly this active-passive pattern: Route 53 returns the primary record while its health check passes, and switches to the secondary when it fails, reverting automatically on recovery. An S3 website endpoint is a valid secondary target.",
    whyWrong: {
      B: "Weighted routing splits traffic by ratio regardless of health, so 1 percent of users would always land on the maintenance page and 99 percent would still hit a broken application during an outage.",
      C: "Two origins without an origin group gives CloudFront no failover rule; origin failover requires the origin group configuration.",
      D: "Latency routing picks the fastest endpoint, and the static page would often win, serving maintenance content to healthy users."
    }
  },

  {
    id: "res-023",
    domain: "Design Resilient Architectures",
    topic: "Disaster recovery strategies",
    difficulty: "medium",
    type: "single",
    question:
      "A back-office system has an RTO of four hours and an RPO of 15 minutes. Finance will not pay to run duplicate application servers continuously, but continuous database replication is acceptable. Which strategy fits?",
    options: [
      { id: "A", text: "Pilot light: replicate the database continuously to the second Region and keep application infrastructure defined but switched off until needed." },
      { id: "B", text: "Warm standby with a scaled-down but always-running copy of the full stack." },
      { id: "C", text: "Backup and restore from nightly snapshots copied cross-Region." },
      { id: "D", text: "Multi-site active/active across both Regions." }
    ],
    correct: ["A"],
    explanation:
      "Pilot light keeps the data layer live and current — satisfying a 15-minute RPO — while application servers exist only as definitions until a disaster, which is what avoids paying to run them. Provisioning and starting them fits comfortably inside a four-hour RTO.",
    whyWrong: {
      B: "Warm standby would meet the targets easily but runs application servers continuously, which finance has ruled out.",
      C: "Nightly snapshots give an RPO measured in hours, far outside the 15-minute requirement.",
      D: "Active/active is the most expensive option and duplicates everything continuously."
    }
  },

  {
    id: "res-024",
    domain: "Design Resilient Architectures",
    topic: "S3 durability and replication",
    difficulty: "medium",
    type: "single",
    question:
      "A regulator requires that objects replicated to a second Region arrive within 15 minutes of being written, with evidence that the target is being met. What should the architect enable?",
    options: [
      { id: "A", text: "S3 Replication Time Control on the replication rule, with its replication metrics and events monitored in CloudWatch." },
      { id: "B", text: "Standard S3 Cross-Region Replication, which already guarantees delivery within 15 minutes." },
      { id: "C", text: "S3 Transfer Acceleration on the destination bucket." },
      { id: "D", text: "A Lambda function triggered on object creation that copies each object to the second Region." }
    ],
    correct: ["A"],
    explanation:
      "Replication Time Control adds a service level agreement that 99.99 percent of objects replicate within 15 minutes, and it publishes replication metrics and events so you can demonstrate compliance and alarm when objects fall behind.",
    whyWrong: {
      B: "Standard replication is typically fast but carries no time commitment and no metrics, so neither the guarantee nor the evidence exists.",
      C: "Transfer Acceleration speeds uploads from distant clients into a bucket; it plays no part in bucket-to-bucket replication.",
      D: "A custom copier reimplements replication with worse retry semantics and no SLA, and needs its own monitoring."
    }
  },

  {
    id: "res-025",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "medium",
    type: "single",
    question:
      "Consumers of an SQS queue occasionally process the same message twice, and the logs show the duplicate starting about 30 seconds after the first attempt while the original consumer is still working. What should be changed?",
    options: [
      { id: "A", text: "Increase the queue's visibility timeout so it exceeds the longest processing time, or have the consumer extend it while working." },
      { id: "B", text: "Enable long polling on the queue." },
      { id: "C", text: "Reduce the message retention period." },
      { id: "D", text: "Increase the number of consumers so messages are handled faster." }
    ],
    correct: ["A"],
    explanation:
      "A message becomes visible again when its visibility timeout expires, so if processing routinely takes longer than the timeout another consumer picks it up while the first is still working. Raising the timeout past the worst-case processing time — or calling ChangeMessageVisibility to extend it in flight — removes the duplicate delivery.",
    whyWrong: {
      B: "Long polling reduces empty receive responses and their cost; it has no effect on when an in-flight message becomes visible again.",
      C: "Retention controls how long an unconsumed message survives, which is unrelated to redelivery during processing.",
      D: "More consumers increases the chance of a second consumer grabbing the redelivered message sooner, making the symptom more frequent."
    }
  },

  {
    id: "res-026",
    domain: "Design Resilient Architectures",
    topic: "Aurora high availability",
    difficulty: "medium",
    type: "single",
    question:
      "A bad migration script corrupted data in an Aurora MySQL cluster twenty minutes ago. The team needs the cluster returned to its state just before the script ran, as quickly as possible, and Backtrack was enabled on the cluster. What should they do?",
    options: [
      { id: "A", text: "Backtrack the cluster to a timestamp immediately before the script ran." },
      { id: "B", text: "Restore the most recent automated snapshot to a new cluster and repoint the application." },
      { id: "C", text: "Promote an Aurora Replica to writer." },
      { id: "D", text: "Perform a point-in-time restore into a new cluster and migrate the data back." }
    ],
    correct: ["A"],
    explanation:
      "Backtrack rewinds an Aurora MySQL cluster in place to a prior point in time without restoring from a backup, typically completing in minutes. Because it operates on the existing cluster, there is no new endpoint and no application reconfiguration.",
    whyWrong: {
      B: "A snapshot restore creates a new cluster, takes considerably longer, and loses everything written since the snapshot.",
      C: "Replicas contain the same corrupted data, since the corruption replicated to them.",
      D: "Point-in-time restore also builds a new cluster and is slower than an in-place rewind when Backtrack is available."
    }
  },

  {
    id: "perf-019",
    domain: "Design High-Performing Architectures",
    topic: "Read scaling with ElastiCache",
    difficulty: "medium",
    type: "single",
    question:
      "A team needs a cache that survives node failure without losing its contents, supports sorted sets for a leaderboard, and can replicate across Availability Zones. Which engine should they choose?",
    options: [
      { id: "A", text: "ElastiCache for Redis with a replication group across multiple AZs." },
      { id: "B", text: "ElastiCache for Memcached with multiple nodes." },
      { id: "C", text: "DynamoDB Accelerator." },
      { id: "D", text: "An EC2 fleet running a self-managed cache." }
    ],
    correct: ["A"],
    explanation:
      "Redis provides replication with automatic failover across Availability Zones, optional persistence, and rich data structures including sorted sets — which is what a leaderboard needs. Memcached has none of those.",
    whyWrong: {
      B: "Memcached is a simple multi-threaded key-value cache with no replication, no persistence and no sorted sets; losing a node loses its data.",
      C: "DAX caches DynamoDB API calls specifically and offers no general-purpose data structures.",
      D: "Self-managing a cache fleet adds patching, failover and monitoring work that ElastiCache already provides."
    }
  },

  {
    id: "perf-020",
    domain: "Design High-Performing Architectures",
    topic: "EBS volume type selection",
    difficulty: "medium",
    type: "single",
    question:
      "A latency-sensitive database on EC2 needs sustained 80,000 IOPS on a single volume with consistent sub-millisecond latency, and the highest available volume durability. Which EBS volume type should be attached?",
    options: [
      { id: "A", text: "io2 Block Express" },
      { id: "B", text: "gp3 with maximum provisioned IOPS" },
      { id: "C", text: "st1 throughput-optimised HDD" },
      { id: "D", text: "Multiple gp2 volumes in a RAID 0 stripe" }
    ],
    correct: ["A"],
    explanation:
      "gp3 tops out at 16,000 IOPS per volume, so 80,000 IOPS on a single volume requires Provisioned IOPS. io2 Block Express supports far higher IOPS with sub-millisecond latency and offers higher durability than the general purpose types, which matches every stated requirement.",
    whyWrong: {
      B: "gp3 cannot reach 80,000 IOPS on one volume regardless of how much is provisioned.",
      C: "st1 is a throughput-oriented HDD for large sequential workloads and is entirely unsuited to low-latency random database I/O.",
      D: "Striping increases aggregate IOPS but multiplies failure exposure and adds management complexity, and gp2's per-volume ceiling still applies."
    }
  },

  {
    id: "perf-021",
    domain: "Design High-Performing Architectures",
    topic: "CloudFront and content delivery",
    difficulty: "medium",
    type: "single",
    question:
      "A media site serves content through CloudFront from an origin in one Region. The business wants viewers to keep receiving content if that origin becomes unavailable, without changing DNS or waiting for a manual switch. What should be configured?",
    options: [
      { id: "A", text: "A CloudFront origin group with a primary and secondary origin, and failover criteria on the relevant HTTP status codes." },
      { id: "B", text: "A second CloudFront distribution pointing at a backup origin, with Route 53 failover between the distributions." },
      { id: "C", text: "A longer cache TTL so cached objects survive an origin outage." },
      { id: "D", text: "Lambda@Edge functions that retry the origin on failure." }
    ],
    correct: ["A"],
    explanation:
      "An origin group defines a primary and a secondary origin plus the status codes that constitute a failure. CloudFront retries the secondary automatically within the same request, so viewers are served without any DNS change or human intervention.",
    whyWrong: {
      B: "This works but relies on DNS propagation and resolver caching, so failover is slower, and it doubles the distributions to manage.",
      C: "A longer TTL only helps for objects already cached at that edge location; anything not cached, or newly requested, still fails.",
      D: "Lambda@Edge could implement retry logic by hand, but it duplicates a built-in feature and adds execution cost to every request."
    }
  },

  {
    id: "perf-022",
    domain: "Design High-Performing Architectures",
    topic: "Shared file storage selection",
    difficulty: "medium",
    type: "single",
    question:
      "A Windows-based application must be migrated to AWS. It requires a shared file system accessible over SMB, with Active Directory integration for file and folder permissions, and Multi-AZ availability. Which service should be used?",
    options: [
      { id: "A", text: "Amazon FSx for Windows File Server in a Multi-AZ deployment." },
      { id: "B", text: "Amazon EFS mounted on the Windows instances." },
      { id: "C", text: "Amazon S3 with a mounted file gateway on each instance." },
      { id: "D", text: "An EBS Multi-Attach io2 volume shared between the instances." }
    ],
    correct: ["A"],
    explanation:
      "FSx for Windows File Server provides a fully managed native Windows file system over SMB, integrates with Active Directory so NTFS permissions work as they do on premises, and offers a Multi-AZ deployment with automatic failover.",
    whyWrong: {
      B: "EFS is an NFS file system and is not supported for Windows instances.",
      C: "File Gateway is designed for hybrid access from on premises and does not provide AD-integrated NTFS permissions for a Windows application fleet.",
      D: "Multi-Attach allows a volume to attach to several instances but provides no shared file system semantics; a clustered file system would be required, and it is single-AZ."
    }
  },

  {
    id: "perf-023",
    domain: "Design High-Performing Architectures",
    topic: "Streaming ingestion with Kinesis",
    difficulty: "medium",
    type: "single",
    question:
      "Clickstream events must be delivered continuously into Amazon S3 in Parquet format for later analysis. There is no requirement for multiple independent consumers or replay, and the team wants no code to maintain. Which service fits best?",
    options: [
      { id: "A", text: "Amazon Kinesis Data Firehose, with format conversion to Parquet and delivery to S3." },
      { id: "B", text: "Amazon Kinesis Data Streams with a custom consumer application writing to S3." },
      { id: "C", text: "Amazon SQS with a Lambda consumer batching writes to S3." },
      { id: "D", text: "Amazon MSK with a Kafka Connect S3 sink." }
    ],
    correct: ["A"],
    explanation:
      "Firehose is the fully managed delivery path: it buffers incoming records, can convert them to Parquet, partitions and writes them to S3, and requires no consumer application. With no need for multiple consumers or replay, its simplicity is exactly right.",
    whyWrong: {
      B: "Data Streams is the right choice when you need replay or several independent consumers, but here it means writing and operating a consumer for no benefit.",
      C: "SQS plus Lambda works but is code to own, and it provides no native Parquet conversion or partitioned delivery.",
      D: "MSK is a managed Kafka cluster — substantial operational surface for a requirement Firehose satisfies with configuration alone."
    }
  },

  {
    id: "perf-024",
    domain: "Design High-Performing Architectures",
    topic: "Compute selection for workloads",
    difficulty: "medium",
    type: "single",
    question:
      "A containerised Java service runs on x86 instances at steady load. The team compiles from source, has no native x86-only dependencies, and wants the best price-performance available without changing the application's behaviour. What should they evaluate first?",
    options: [
      { id: "A", text: "Moving to AWS Graviton-based instances, rebuilding the container image for arm64." },
      { id: "B", text: "Moving to burstable T-family instances to reduce the hourly rate." },
      { id: "C", text: "Moving to memory-optimised instances for extra headroom." },
      { id: "D", text: "Enabling hibernation on the instances between requests." }
    ],
    correct: ["A"],
    explanation:
      "Graviton processors generally deliver better price-performance than comparable x86 instances for scale-out workloads such as containerised Java services. The prerequisite is an arm64 build, which a team compiling from source with no x86-only dependencies can produce readily.",
    whyWrong: {
      B: "Burstable instances suit intermittent load; at steady load they exhaust CPU credits and either throttle or incur surplus charges.",
      C: "Memory-optimised instances cost more per vCPU and address a bottleneck the scenario does not describe.",
      D: "Hibernation is for instances that are idle for long periods, not for a service under steady load."
    }
  },

  {
    id: "cost-016",
    domain: "Design Cost-Optimized Architectures",
    topic: "Compute pricing models",
    difficulty: "hard",
    type: "single",
    question:
      "A company runs a stable fleet of m6i instances in one Region and is confident the instance family will not change for three years. It wants the deepest possible discount on that steady usage. Which commitment should it choose?",
    options: [
      { id: "A", text: "EC2 Instance Savings Plans committed to the m6i family in that Region." },
      { id: "B", text: "Compute Savings Plans." },
      { id: "C", text: "On-Demand Capacity Reservations." },
      { id: "D", text: "Spot Instances with a capacity-optimised allocation strategy." }
    ],
    correct: ["A"],
    explanation:
      "EC2 Instance Savings Plans offer a larger discount than Compute Savings Plans in exchange for committing to a specific instance family in a specific Region. When the family genuinely will not change, that trade is worth taking; size, operating system and tenancy remain flexible within the family.",
    whyWrong: {
      B: "Compute Savings Plans are more flexible — across family, Region, Fargate and Lambda — but discount less deeply, so they are the wrong choice when the flexibility is not needed.",
      C: "Capacity Reservations guarantee capacity in an Availability Zone; on their own they carry no discount at all.",
      D: "Spot is for interruption-tolerant workloads, not a stable production fleet."
    }
  },

  {
    id: "cost-017",
    domain: "Design Cost-Optimized Architectures",
    topic: "Data transfer and NAT cost",
    difficulty: "medium",
    type: "single",
    question:
      "A popular site serves large images and video directly from EC2 instances to users worldwide, and data transfer out to the internet dominates the bill. Which change reduces that cost most effectively?",
    options: [
      { id: "A", text: "Serve the static assets through Amazon CloudFront, whose data transfer out is cheaper and whose cached hits do not return to the origin." },
      { id: "B", text: "Move the instances to a Region with lower compute prices." },
      { id: "C", text: "Compress responses more aggressively on the instances." },
      { id: "D", text: "Attach Elastic IP addresses to reduce per-request overhead." }
    ],
    correct: ["A"],
    explanation:
      "CloudFront's data transfer out to the internet is priced lower than EC2's, and once an object is cached at an edge location subsequent requests are served without returning to the origin at all. For a static-heavy, globally distributed workload that is the largest available saving, and it improves latency too.",
    whyWrong: {
      B: "Regional price differences apply mainly to compute; the dominant cost here is egress, and moving does not remove it.",
      C: "Compression helps at the margin and is worth doing, but it does not change the price per gigabyte or eliminate origin fetches.",
      D: "Elastic IPs are addresses, not a transfer discount; an unattached one actually incurs a charge."
    }
  },

  {
    id: "cost-018",
    domain: "Design Cost-Optimized Architectures",
    topic: "Lifecycle policies and archival",
    difficulty: "medium",
    type: "single",
    question:
      "An audit of a bucket used for large uploads shows storage billed well above the total size of the visible objects. Many uploads are interrupted by unreliable client connections. What should the architect configure?",
    options: [
      { id: "A", text: "A lifecycle rule that aborts incomplete multipart uploads after a set number of days." },
      { id: "B", text: "A lifecycle rule transitioning objects to S3 Standard-IA after 30 days." },
      { id: "C", text: "S3 Versioning with a rule expiring noncurrent versions." },
      { id: "D", text: "S3 Intelligent-Tiering on the bucket." }
    ],
    correct: ["A"],
    explanation:
      "Parts of a multipart upload that never completes remain stored and billable but do not appear as objects, which is precisely the discrepancy described. A lifecycle rule with AbortIncompleteMultipartUpload cleans them up automatically after the configured number of days.",
    whyWrong: {
      B: "Transitioning storage class changes the rate for visible objects and does nothing about invisible orphaned parts.",
      C: "Noncurrent version expiry addresses old versions, which only exist if versioning is enabled — a different cause of hidden storage.",
      D: "Intelligent-Tiering optimises access-pattern costs for real objects and never touches incomplete uploads."
    }
  },

  {
    id: "cost-019",
    domain: "Design Cost-Optimized Architectures",
    topic: "Right-sizing and cost visibility",
    difficulty: "medium",
    type: "single",
    question:
      "Finance wants to be told automatically when spend deviates from its normal pattern — for example a service that suddenly costs three times its usual daily amount — rather than discovering it at month end. Setting a fixed threshold per service is not practical. What should be enabled?",
    options: [
      { id: "A", text: "AWS Cost Anomaly Detection with monitors and alert subscriptions." },
      { id: "B", text: "An AWS Budget set at 100 percent of last month's total spend." },
      { id: "C", text: "A daily Cost Explorer report emailed to the finance team." },
      { id: "D", text: "AWS Compute Optimizer recommendations reviewed weekly." }
    ],
    correct: ["A"],
    explanation:
      "Cost Anomaly Detection learns each service's normal spend pattern and alerts when actual spend deviates significantly, which is exactly the requirement when fixed thresholds per service are impractical. Monitors scope what is watched and subscriptions define who is alerted.",
    whyWrong: {
      B: "A single total-spend budget catches only aggregate overruns; a tripling in one small service can hide inside an unchanged total.",
      C: "A daily report still requires someone to read and interpret it, and provides no notion of what is anomalous.",
      D: "Compute Optimizer recommends right-sizing for utilisation; it does not detect spend anomalies."
    }
  },

  {
    id: "cost-020",
    domain: "Design Cost-Optimized Architectures",
    topic: "Environment scheduling and idle resources",
    difficulty: "easy",
    type: "multi",
    question:
      "A cost review of a mostly dormant account finds several charges for resources nobody is using. Which TWO of the following continue to incur charges even when nothing is actively using them?",
    options: [
      { id: "A", text: "An Elastic IP address that is allocated but not associated with a running instance." },
      { id: "B", text: "An Application Load Balancer that exists but receives no requests." },
      { id: "C", text: "A stopped EC2 instance's instance hours." },
      { id: "D", text: "An empty S3 bucket." },
      { id: "E", text: "An IAM role that is never assumed." }
    ],
    correct: ["A", "B"],
    explanation:
      "Both are charged for existing rather than for being used. An idle or unassociated Elastic IP address incurs an hourly charge, and a load balancer bills an hourly rate for as long as it is provisioned regardless of traffic. Hunting these down is standard practice in a cost review.",
    whyWrong: {
      C: "A stopped instance stops accruing instance hours — though its attached EBS volumes continue to be billed.",
      D: "S3 charges for stored data and requests, so an empty bucket costs nothing.",
      E: "IAM roles, users and policies are free."
    }
  },

  /* ==========================================================
   * Batch 5 — written directly against a failed practice exam
   * (38/65). Every question here targets a concept that was
   * actually missed, reworded as an original scenario.
   * ========================================================== */

  {
    id: "sec-036",
    domain: "Design Secure Architectures",
    topic: "Security groups vs NACLs",
    difficulty: "hard",
    type: "single",
    question:
      "An EC2 instance sits in a subnet whose network ACL allows all inbound traffic and denies all outbound traffic. Its security group allows SSH inbound from anywhere and has no outbound rules. An administrator cannot establish an SSH session to the instance. What must change?",
    options: [
      { id: "A", text: "The network ACL must be modified to allow outbound traffic, because network ACLs are stateless and the SSH response is outbound traffic." },
      { id: "B", text: "The security group must be modified to allow outbound traffic." },
      { id: "C", text: "Both the security group and the network ACL must be modified to allow outbound traffic." },
      { id: "D", text: "Nothing — the instance is already reachable over SSH from any address." }
    ],
    correct: ["A"],
    explanation:
      "Network ACLs are stateless, so the reply packets of an allowed inbound connection are evaluated separately against the outbound rules. Denying all outbound traffic means the SSH response never leaves, and the session never establishes. Security groups are stateful, so the empty outbound rule set is irrelevant — return traffic for an allowed inbound flow is permitted automatically.",
    whyWrong: {
      B: "A security group with no outbound rules still returns traffic for allowed inbound connections, because it is stateful. Changing it is unnecessary.",
      C: "Only the network ACL needs changing. Adding an outbound rule to the security group would be harmless but is not what is blocking the session.",
      D: "The connection fails, because the outbound half of the flow is denied at the subnet boundary."
    }
  },

  {
    id: "sec-037",
    domain: "Design Secure Architectures",
    topic: "Security groups vs NACLs",
    difficulty: "hard",
    type: "single",
    question:
      "A subnet's network ACL has inbound rule 100 allowing all traffic from 0.0.0.0/0, and inbound rule 200 denying TCP port 3306 from 203.0.113.25. A request arrives from 203.0.113.25 on port 3306. What happens, and why?",
    options: [
      { id: "A", text: "It is allowed, because network ACL rules are evaluated in ascending rule-number order and the first match wins — rule 100 matches first." },
      { id: "B", text: "It is denied, because an explicit deny always overrides an allow." },
      { id: "C", text: "It is allowed at first and then denied once rule 200 is evaluated." },
      { id: "D", text: "It is denied, because the default rule at the end of every network ACL denies all traffic." }
    ],
    correct: ["A"],
    explanation:
      "Network ACLs evaluate rules in numerical order and stop at the first match. Rule 100 allows everything and is evaluated before rule 200, so the request is permitted and rule 200 is never reached. Deny rules must be numbered lower than the allow rules they are meant to override.",
    whyWrong: {
      B: "That precedence rule applies to IAM policy evaluation, not to network ACLs, which are strictly first-match-wins by rule number.",
      C: "Evaluation happens once per packet; there is no re-evaluation or delayed change of decision.",
      D: "The default deny only applies when no numbered rule matches, and here rule 100 matched."
    }
  },

  {
    id: "sec-038",
    domain: "Design Secure Architectures",
    topic: "VPC subnet and IP addressing design",
    difficulty: "medium",
    type: "single",
    question:
      "A dual-stack VPC has both IPv4 and IPv6 CIDR blocks, and its IPv4 address space is nearly exhausted. A new EC2 instance cannot launch because no IPv4 addresses remain in the subnet. Which change resolves this and scales for the future?",
    options: [
      { id: "A", text: "Create an IPv6-only subnet with a large CIDR range in the VPC and launch the instance there." },
      { id: "B", text: "Create an additional IPv4 subnet with a larger CIDR range and launch the instance there." },
      { id: "C", text: "Remove all IPv4 CIDR blocks so the VPC uses IPv6 exclusively." },
      { id: "D", text: "Disable IPv4 support on the VPC and use the available IPv6 addresses." }
    ],
    correct: ["A"],
    explanation:
      "IPv6 address space is effectively unlimited, so placing new workloads in an IPv6-only subnet stops consuming the scarce IPv4 space and keeps scaling indefinitely. The VPC remains dual-stack, so existing IPv4 workloads are untouched.",
    whyWrong: {
      B: "This buys time by consuming more of the same limited IPv4 space; the exhaustion returns, so it does not meet the scalability requirement.",
      C: "A VPC cannot be IPv6-only. Every VPC requires an IPv4 CIDR block, which cannot be removed.",
      D: "IPv4 support cannot be disabled on a VPC; it is mandatory, and doing so would break existing IPv4 workloads."
    }
  },

  {
    id: "sec-039",
    domain: "Design Secure Architectures",
    topic: "VPC subnet and IP addressing design",
    difficulty: "medium",
    type: "multi",
    question:
      "An architect is documenting VPC subnet behaviour for a new design. Which TWO statements are correct?",
    options: [
      { id: "A", text: "A subnet resides entirely within a single Availability Zone and cannot span zones." },
      { id: "B", text: "A newly created subnet is associated with the VPC's main route table by default." },
      { id: "C", text: "The allowed VPC CIDR block size ranges from /16 down to /27." },
      { id: "D", text: "Each subnet spans two Availability Zones for redundancy." },
      { id: "E", text: "Instances in a private subnet can reach the internet only if they have an Elastic IP address." }
    ],
    correct: ["A", "B"],
    explanation:
      "A subnet is bound to exactly one Availability Zone, which is why spreading across zones means creating multiple subnets. Any subnet you create is implicitly associated with the VPC's main route table until you associate it with a custom one.",
    whyWrong: {
      C: "The permitted range is /16 through /28, not /27 — a /28 subnet is the smallest allowed.",
      D: "A subnet never spans Availability Zones; the VPC spans them, the subnet does not.",
      E: "Private subnet instances typically reach the internet through a NAT gateway or NAT instance, using no public address of their own."
    }
  },

  {
    id: "sec-040",
    domain: "Design Secure Architectures",
    topic: "VPC endpoints and private connectivity",
    difficulty: "easy",
    type: "single",
    question:
      "Worker instances in a private subnet process sensitive financial records and then write them to Amazon S3. Compliance requires that this traffic never traverse the public internet. What should be configured?",
    options: [
      { id: "A", text: "A VPC endpoint for Amazon S3, with a matching entry in the subnet's route table." },
      { id: "B", text: "A NAT gateway in the private subnet with a route directing S3 traffic through it." },
      { id: "C", text: "An internet gateway attached to the VPC with a route directing S3 traffic through it." },
      { id: "D", text: "A transit gateway with a route directing S3 traffic to Amazon S3." }
    ],
    correct: ["A"],
    explanation:
      "By default, traffic from a VPC to Amazon S3 leaves over the public internet even though both are inside AWS. A VPC endpoint keeps that traffic on the AWS network, requiring no internet gateway, NAT device or public IP address on the instances.",
    whyWrong: {
      B: "A NAT gateway provides outbound access to the internet, so the traffic still traverses the public internet — the opposite of the requirement.",
      C: "An internet gateway is explicitly the public path, and it would also require the instances to sit in a public subnet.",
      D: "Transit Gateway interconnects VPCs and on-premises networks. Amazon S3 sits outside any VPC, so it cannot be reached privately this way."
    }
  },

  {
    id: "sec-041",
    domain: "Design Secure Architectures",
    topic: "KMS key policies and grants",
    difficulty: "hard",
    type: "single",
    question:
      "A company running Amazon EKS must ensure that Kubernetes Secrets — database passwords and API keys — are encrypted at rest inside the cluster's etcd key-value store, using a key the company controls. What should be configured?",
    options: [
      { id: "A", text: "Enable envelope encryption of Kubernetes Secrets on the EKS cluster using a customer managed KMS key." },
      { id: "B", text: "Store the values in AWS Secrets Manager encrypted with a customer managed KMS key." },
      { id: "C", text: "Enable default EBS volume encryption for the account with a customer managed KMS key." },
      { id: "D", text: "Install the EBS CSI driver add-on and use encrypted persistent volumes for the workloads." }
    ],
    correct: ["A"],
    explanation:
      "EKS supports envelope encryption of Kubernetes Secrets, where a KMS key encrypts the data encryption key that protects Secret values before they are written to etcd. That is the only option that encrypts the Secrets inside etcd itself, which is exactly what the requirement states.",
    whyWrong: {
      B: "Secrets Manager is an excellent external secret store, but it does not encrypt anything already held as a Kubernetes Secret in etcd — it moves the secret somewhere else entirely.",
      C: "EBS encryption protects the worker nodes' block storage. The control plane's etcd store is managed by EKS and is not on your EBS volumes.",
      D: "The EBS CSI driver provides persistent volumes for pods; it has no bearing on how Secrets are stored in etcd."
    }
  },

  {
    id: "res-033",
    domain: "Design Resilient Architectures",
    topic: "Multi-AZ vs multi-Region design",
    difficulty: "hard",
    type: "single",
    question:
      "A web tier must always have at least six EC2 instances running, and the design must tolerate the complete loss of one of three Availability Zones without dropping below six. Which layout is the most cost-effective that still meets this?",
    options: [
      { id: "A", text: "3 instances in each of the three Availability Zones (9 total)." },
      { id: "B", text: "2 instances in each of the three Availability Zones (6 total)." },
      { id: "C", text: "6 instances in each of the three Availability Zones (18 total)." },
      { id: "D", text: "6 instances in each of two Availability Zones and none in the third (12 total)." }
    ],
    correct: ["A"],
    explanation:
      "Losing one zone must still leave six running. With 3 per zone across three zones, an outage removes 3 and leaves 6 — exactly the minimum — at a total of 9 instances. This is the smallest fleet that satisfies the constraint.",
    whyWrong: {
      B: "Losing one zone leaves only 4 instances, below the required minimum, so this is not fault tolerant despite being the cheapest.",
      C: "18 instances survives an outage comfortably but costs twice as much as necessary.",
      D: "12 instances also survives, leaving 6 after a zone loss, but it costs more than the 9-instance layout that meets the same requirement."
    }
  },

  {
    id: "res-034",
    domain: "Design Resilient Architectures",
    topic: "RDS Multi-AZ vs read replicas",
    difficulty: "medium",
    type: "multi",
    question:
      "A reporting workload is overwhelming an Amazon RDS primary instance with read queries. An architect proposes read replicas rather than relying on Multi-AZ. Which TWO statements correctly describe what read replicas provide?",
    options: [
      { id: "A", text: "They scale read capacity beyond the limits of a single database instance for read-heavy workloads." },
      { id: "B", text: "They use asynchronous replication and relieve the primary by absorbing read traffic." },
      { id: "C", text: "They use synchronous replication and fail over automatically when an Availability Zone fails." },
      { id: "D", text: "They accept both reads and writes, complementing the primary instance." },
      { id: "E", text: "They increase the primary instance's provisioned IOPS." }
    ],
    correct: ["A", "B"],
    explanation:
      "Read replicas are asynchronous copies that serve read-only traffic, so aggregate read throughput scales past what one instance can deliver and the primary is freed to handle writes. They are a scaling feature, not an availability feature.",
    whyWrong: {
      C: "Synchronous replication with automatic failover describes Multi-AZ, which is a different feature; replicas are asynchronous.",
      D: "A read replica accepts read-only connections. It must be promoted to a standalone instance before it can accept writes.",
      E: "Replicas do not change the primary's provisioned IOPS; they reduce the load reaching it."
    }
  },

  {
    id: "res-035",
    domain: "Design Resilient Architectures",
    topic: "Stateless application design",
    difficulty: "medium",
    type: "single",
    question:
      "A content management system runs on an Auto Scaling fleet of Linux EC2 instances across several Availability Zones. User-uploaded documents are currently written to an EBS volume attached to one instance, so other instances cannot see them and performance is poor. What should replace it?",
    options: [
      { id: "A", text: "Amazon EFS, providing a POSIX-compliant file system that every instance can mount concurrently across Availability Zones." },
      { id: "B", text: "An Amazon S3 bucket used as the file system for the application." },
      { id: "C", text: "Larger Provisioned IOPS SSD EBS volumes on each instance." },
      { id: "D", text: "Amazon ElastiCache to cache the uploaded documents." }
    ],
    correct: ["A"],
    explanation:
      "The requirement is shared, concurrent, POSIX file-system access from many instances spanning Availability Zones — which is exactly what EFS provides. Moving the documents off the individual instances also makes the fleet stateless, so instances can be replaced freely.",
    whyWrong: {
      B: "S3 is object storage without POSIX semantics or file locking; using it requires application changes and it cannot be mounted as a normal file system.",
      C: "An EBS volume attaches to a single instance, so faster volumes do not make the documents visible to the rest of the fleet.",
      D: "ElastiCache is an in-memory cache, not durable file storage."
    }
  },

  {
    id: "res-036",
    domain: "Design Resilient Architectures",
    topic: "Monitoring and alarms with CloudWatch",
    difficulty: "medium",
    type: "single",
    question:
      "An operations team must track memory utilisation and disk space used on a mixed fleet of Linux and Windows EC2 instances, and view those figures alongside the existing CPU metrics. What is required?",
    options: [
      { id: "A", text: "Install the unified CloudWatch agent on the instances to publish memory and disk metrics as custom metrics." },
      { id: "B", text: "Nothing — memory and disk utilisation are included in the default EC2 metrics." },
      { id: "C", text: "Enable Enhanced Monitoring on the EC2 instances." },
      { id: "D", text: "Install the Amazon Inspector agent on all instances." }
    ],
    correct: ["A"],
    explanation:
      "EC2 publishes CPU, network and disk I/O metrics from the hypervisor, but memory utilisation and disk space used are visible only from inside the operating system. The unified CloudWatch agent runs on both Linux and Windows and publishes them as custom metrics.",
    whyWrong: {
      B: "Memory and disk space are specifically absent from the default EC2 metric set — this is one of the most commonly tested gaps.",
      C: "Enhanced Monitoring is an Amazon RDS feature that reports OS metrics for database instances; it does not apply to EC2.",
      D: "Inspector performs security and vulnerability assessment, not performance metric collection."
    }
  },

  {
    id: "res-037",
    domain: "Design Resilient Architectures",
    topic: "Auto Scaling and health checks",
    difficulty: "medium",
    type: "single",
    question:
      "A weekly sales promotion causes brief downtime because instances take several minutes to initialise and reactive scaling starts too late. The traffic pattern repeats reliably each week. Which solution launches capacity ahead of the load with the least effort?",
    options: [
      { id: "A", text: "Enable predictive scaling on the Auto Scaling group." },
      { id: "B", text: "Create a dynamic scaling policy on average CPU utilisation." },
      { id: "C", text: "Schedule an EventBridge rule that invokes a Lambda function to resize the group every night." },
      { id: "D", text: "Analyse the pattern with a machine learning service and build scheduled policies from the predictions." }
    ],
    correct: ["A"],
    explanation:
      "Predictive scaling uses machine learning over the group's own CloudWatch history to forecast load and provision capacity in advance. It is designed for exactly this combination — regular recurring patterns plus long initialisation times — and is a setting rather than something to build.",
    whyWrong: {
      B: "Dynamic scaling is reactive: it acts only after utilisation has already risen, which is the problem when instances need minutes to start.",
      C: "A nightly resize is crude, needs maintaining, and breaks whenever the promotion schedule changes.",
      D: "This reimplements predictive scaling by hand, with far more effort and no better result."
    }
  },

  {
    id: "res-038",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "easy",
    type: "single",
    question:
      "A company needs to decouple components of an application where some processing runs on EC2 instances in AWS and some still runs on servers in its own data centre. Which service allows both sides to exchange work reliably without being directly connected?",
    options: [
      { id: "A", text: "Amazon SQS, which both on-premises servers and EC2 instances can send to and poll from over the API." },
      { id: "B", text: "VPC peering between the on-premises network and the VPC." },
      { id: "C", text: "Amazon RDS, with both sides reading and writing a shared work table." },
      { id: "D", text: "Amazon DynamoDB, with both sides polling a shared items table." }
    ],
    correct: ["A"],
    explanation:
      "SQS is a fully managed queue reachable over its public API from anywhere with credentials, so on-premises producers and EC2 consumers can exchange messages without any network-level coupling. Buffering in the queue is what decouples the two sides.",
    whyWrong: {
      B: "VPC peering connects two VPCs; it cannot peer with an on-premises network, and network connectivity is not decoupling.",
      C: "A shared relational table couples both sides to one schema and turns into a polling and locking problem — a database is not a queue.",
      D: "The same applies to DynamoDB: it is a database, and using it as a queue means building retries, visibility and ordering yourself."
    }
  },

  {
    id: "res-039",
    domain: "Design Resilient Architectures",
    topic: "Aurora high availability",
    difficulty: "medium",
    type: "single",
    question:
      "An Aurora cluster's single read replica cannot keep up with read traffic during unpredictable peak periods, but the load is light for most of the day. Which solution handles the peaks most cost-effectively?",
    options: [
      { id: "A", text: "Enable Aurora Auto Scaling so replicas are added during peaks and removed afterwards." },
      { id: "B", text: "Increase the instance size of every member of the Aurora DB cluster." },
      { id: "C", text: "Convert the cluster to an Aurora Global Database and read from the secondary Region." },
      { id: "D", text: "Add a cross-Region read replica and send peak read traffic to it." }
    ],
    correct: ["A"],
    explanation:
      "Aurora Auto Scaling adds and removes Aurora Replicas based on a target metric such as average CPU or connections, so extra read capacity exists only while the peak lasts. Because the load is light most of the day, paying only during peaks is what makes it the cheapest option.",
    whyWrong: {
      B: "Scaling up bills for the larger capacity around the clock, including the long quiet periods.",
      C: "A Global Database is for cross-Region availability and low-latency global reads; it adds replication and data transfer cost that this single-Region problem does not need.",
      D: "A cross-Region replica adds inter-Region data transfer charges and latency to solve a problem that is entirely within one Region."
    }
  },

  {
    id: "perf-032",
    domain: "Design High-Performing Architectures",
    topic: "Analytics with Athena and Redshift",
    difficulty: "medium",
    type: "single",
    question:
      "Sales data of unknown and varying structure accumulates in Amazon S3. Analysts need to run ad-hoc SQL against it to answer business questions. Which approach has the least operational overhead?",
    options: [
      { id: "A", text: "Run an AWS Glue crawler to populate tables in the Glue Data Catalog, then query the data with Amazon Athena." },
      { id: "B", text: "Load the data into Amazon Redshift and query it there with Redshift SQL." },
      { id: "C", text: "Run a Spark job on Amazon EMR Serverless with an external Hive metastore on Amazon Aurora MySQL." },
      { id: "D", text: "Crawl the data with AWS Glue and query it using Amazon Managed Service for Apache Flink." }
    ],
    correct: ["A"],
    explanation:
      "The crawler infers the schema and registers tables in the Glue Data Catalog, which Athena uses natively. Nothing is provisioned, nothing is loaded and no ETL is written — analysts point Athena at the catalogue and run SQL.",
    whyWrong: {
      B: "Loading S3 data into Redshift is an ETL exercise requiring schema design and ongoing cluster operation, which is significant overhead for ad-hoc questions.",
      C: "Running an external Hive metastore on Aurora is extra infrastructure to configure and operate when the Glue Data Catalog already fills that role.",
      D: "Managed Service for Apache Flink processes streaming data from sources such as Kinesis or MSK, not static objects sitting in S3."
    }
  },

  {
    id: "perf-033",
    domain: "Design High-Performing Architectures",
    topic: "Analytics with Athena and Redshift",
    difficulty: "medium",
    type: "single",
    question:
      "A daily AWS Glue ETL job reads from an S3 prefix and has grown steadily slower because each run reprocesses all the data written on previous days as well as the new data. What is the most operationally efficient fix?",
    options: [
      { id: "A", text: "Enable job bookmarks on the Glue job so each run processes only data that has arrived since the last successful run." },
      { id: "B", text: "Delete already-processed objects with a Lambda function triggered when the job succeeds." },
      { id: "C", text: "Split the dataset into partitions and process them in parallel on multiple EC2 instances." },
      { id: "D", text: "Increase the number of workers allocated to the Glue job." }
    ],
    correct: ["A"],
    explanation:
      "Job bookmarks persist state about what a Glue job has already processed, so subsequent runs pick up only new data. That removes the reprocessing entirely and is a setting on the job rather than new infrastructure.",
    whyWrong: {
      B: "Deleting source data is risky — a failed run that needs rerunning would find its input gone — and it adds a Lambda and event rule to maintain.",
      C: "Parallelism makes the job process everything faster; it does not stop it processing old data repeatedly.",
      D: "More workers has the same flaw and increases cost while the root cause remains."
    }
  },

  {
    id: "perf-034",
    domain: "Design High-Performing Architectures",
    topic: "Aurora endpoints and read scaling",
    difficulty: "medium",
    type: "single",
    question:
      "An application on ECS connects to an Aurora cluster that has two Aurora Replicas. Read queries are all landing on one replica while the other sits idle. Which change distributes read connections across both replicas with no additional infrastructure?",
    options: [
      { id: "A", text: "Point read queries at the cluster's built-in reader endpoint." },
      { id: "B", text: "Point read queries at the cluster's built-in cluster (writer) endpoint." },
      { id: "C", text: "Put a Network Load Balancer in front of the two replicas and connect through it." },
      { id: "D", text: "Enable Aurora Parallel Query on the cluster." }
    ],
    correct: ["A"],
    explanation:
      "Every Aurora cluster has a reader endpoint that load balances connections across the available Aurora Replicas. Pointing read traffic at it spreads connections without any load balancer or client-side logic.",
    whyWrong: {
      B: "The cluster endpoint always resolves to the current writer, so all read traffic would land on the primary instance instead.",
      C: "An NLB balances traffic to servers but is not the mechanism Aurora provides for replica connections, and it adds cost and a component to operate.",
      D: "Parallel Query pushes parts of a single query down into the storage layer to speed it up. It does not distribute connections across replicas."
    }
  },

  {
    id: "perf-035",
    domain: "Design High-Performing Architectures",
    topic: "DynamoDB performance and caching",
    difficulty: "hard",
    type: "multi",
    question:
      "A serverless mobile game backend uses a DynamoDB table that was created with the AWS CLI, plus Lambda behind API Gateway. Millions of daily users are causing latency and rising cost. Which TWO changes improve performance and scalability while keeping cost controlled?",
    options: [
      { id: "A", text: "Enable DynamoDB Accelerator (DAX) and turn on DynamoDB auto scaling with an appropriate maximum capacity." },
      { id: "B", text: "Enable caching in API Gateway for frequently requested responses." },
      { id: "C", text: "Rely on DynamoDB auto scaling being enabled by default and simply add DAX." },
      { id: "D", text: "Put CloudFront in front of the DynamoDB table as its origin." },
      { id: "E", text: "Manually raise the provisioned read and write capacity to a high fixed value." }
    ],
    correct: ["A", "B"],
    explanation:
      "DAX puts an in-memory, DynamoDB-API-compatible cache in front of the table, cutting read latency to microseconds and reducing consumed read capacity. Auto scaling then matches provisioned capacity to demand instead of a fixed ceiling. Caching responses at API Gateway removes repeat work from the whole stack.",
    whyWrong: {
      C: "Auto scaling is not enabled by default for a table created through the CLI or API — only the console's default settings turn it on — so it must be enabled explicitly.",
      D: "CloudFront cannot use a DynamoDB table as an origin; the two do not integrate that way.",
      E: "A high fixed capacity bills around the clock regardless of traffic, which is the cost problem rather than the solution."
    }
  },

  {
    id: "perf-036",
    domain: "Design High-Performing Architectures",
    topic: "Serverless compute with Lambda",
    difficulty: "medium",
    type: "single",
    question:
      "An application is packaged as a Docker image in Amazon ECR, must run on a fully managed serverless compute service, and needs 5 GB of ephemeral scratch space for temporary processing during each invocation. Which option meets all three requirements?",
    options: [
      { id: "A", text: "An AWS Lambda function using container image support, with ephemeral storage configured to 5 GB." },
      { id: "B", text: "An Amazon ECS service on AWS Fargate running the container image." },
      { id: "C", text: "An AWS Lambda function using container image support, with an Amazon EFS file system attached." },
      { id: "D", text: "An Amazon ECS cluster on EC2 worker nodes with a 5 GB EBS volume attached." }
    ],
    correct: ["A"],
    explanation:
      "Lambda supports container images up to 10 GB and its per-invocation ephemeral storage under /tmp is configurable from 512 MB up to 10 GB. That covers the packaging, the serverless requirement and the scratch space in one service with nothing to manage.",
    whyWrong: {
      B: "Fargate removes instance management but still requires defining and operating clusters, services and task definitions, so it is not the fully managed serverless option here.",
      C: "EFS provides persistent shared storage that survives invocations; the requirement is temporary scratch space, which Lambda's configurable ephemeral storage already provides more simply.",
      D: "EC2 worker nodes are explicitly not serverless — the team would own the instances."
    }
  },

  {
    id: "perf-037",
    domain: "Design High-Performing Architectures",
    topic: "Compute selection for workloads",
    difficulty: "hard",
    type: "multi",
    question:
      "An EBS-backed EC2 instance also has instance store volumes attached and an Elastic IP address associated. A scheduled automation stops the instance overnight and starts it again in the morning. Which TWO things happen as a result of that stop and start?",
    options: [
      { id: "A", text: "All data on the attached instance store volumes is lost." },
      { id: "B", text: "The instance may be moved to a different underlying host computer." },
      { id: "C", text: "The Elastic IP address is disassociated from the instance." },
      { id: "D", text: "The elastic network interface is detached from the instance." },
      { id: "E", text: "Nothing changes; the instance resumes exactly as it was." }
    ],
    correct: ["A", "B"],
    explanation:
      "Instance store volumes are physically attached to the host, so their contents do not survive a stop. Stopping also releases the instance from its host, and starting it again typically places it on different hardware — which is why instance store data cannot persist.",
    whyWrong: {
      C: "In a VPC an Elastic IP address remains associated with the instance across a stop and start.",
      D: "The elastic network interface stays attached to the instance.",
      E: "Two significant things do change — the ephemeral storage is wiped and the underlying host may differ."
    }
  },

  {
    id: "cost-028",
    domain: "Design Cost-Optimized Architectures",
    topic: "S3 storage class selection",
    difficulty: "medium",
    type: "single",
    question:
      "A pipeline writes temporary log files to Amazon S3 that are deleted after roughly 12 hours. The volume is unpredictable. Which storage class costs least for this pattern?",
    options: [
      { id: "A", text: "S3 Standard" },
      { id: "B", text: "S3 Standard-IA" },
      { id: "C", text: "S3 One Zone-IA" },
      { id: "D", text: "S3 Glacier Deep Archive" }
    ],
    correct: ["A"],
    explanation:
      "The infrequent-access and archive classes impose minimum storage durations — 30 days for Standard-IA and One Zone-IA, 180 days for Deep Archive — and an object deleted earlier is still billed for the full minimum. S3 Standard has no minimum duration, so 12 hours of data is billed as 12 hours.",
    whyWrong: {
      B: "Deleting after 12 hours still incurs the 30-day minimum charge, making it far more expensive than Standard for this pattern.",
      C: "One Zone-IA carries the same 30-day minimum, and it also stores data in a single Availability Zone.",
      D: "Deep Archive has the lowest per-GB rate but a 180-day minimum, so 12-hour objects would be billed for 180 days."
    }
  },

  {
    id: "cost-029",
    domain: "Design Cost-Optimized Architectures",
    topic: "Compute pricing models",
    difficulty: "medium",
    type: "single",
    question:
      "A video transcoding fleet pulls jobs from a queue; if an instance disappears mid-job the message becomes visible again and another instance picks it up. The team wants to add temporary capacity to clear a large backlog as cheaply as possible, then release it. Which purchasing option fits?",
    options: [
      { id: "A", text: "Spot Instances" },
      { id: "B", text: "On-Demand Instances" },
      { id: "C", text: "Standard Reserved Instances" },
      { id: "D", text: "Dedicated Instances" }
    ],
    correct: ["A"],
    explanation:
      "The queue already makes the work interruption-tolerant — an interrupted job is simply redelivered — and the capacity is temporary. That is precisely the Spot use case, at the steepest discount off On-Demand, with a two-minute interruption notice.",
    whyWrong: {
      B: "On-Demand works but costs substantially more for work that tolerates interruption.",
      C: "Reserved Instances commit for one or three years, which is absurd for capacity needed until a backlog clears.",
      D: "Dedicated Instances are the most expensive option and exist for licensing and isolation requirements."
    }
  },

  {
    id: "cost-030",
    domain: "Design Cost-Optimized Architectures",
    topic: "Database cost optimization",
    difficulty: "medium",
    type: "single",
    question:
      "A company runs Multi-AZ RDS MySQL for its production, test and development environments, and Reserved EC2 web servers behind a load balancer that sit at 90 percent CPU. Which change reduces cost without affecting the availability or performance of mission-critical systems?",
    options: [
      { id: "A", text: "Run the development and test databases as Single-AZ deployments." },
      { id: "B", text: "Replace the Reserved web server instances with On-Demand instances." },
      { id: "C", text: "Replace the Reserved web server instances with Spot Instances." },
      { id: "D", text: "Remove the Elastic Load Balancer." }
    ],
    correct: ["A"],
    explanation:
      "Multi-AZ roughly doubles database cost by running a standby, and non-production environments rarely justify that. Dropping it for development and test cuts spend while leaving the production database, the web tier and availability untouched.",
    whyWrong: {
      B: "On-Demand is more expensive than Reserved for steady long-running instances, so this increases cost.",
      C: "Spot instances can be reclaimed at two minutes' notice, which is unacceptable for production web servers already running at 90 percent CPU.",
      D: "The load balancer provides the distribution and health checking the production tier depends on; removing it damages availability."
    }
  },

  {
    id: "cost-031",
    domain: "Design Cost-Optimized Architectures",
    topic: "Right-sizing and cost visibility",
    difficulty: "medium",
    type: "single",
    question:
      "A team is building an internal tool that must programmatically retrieve historical AWS usage costs for specific services and obtain forecasts of future spend. Which approach involves the least operational overhead?",
    options: [
      { id: "A", text: "Call the AWS Cost Explorer API, paginating through the results." },
      { id: "B", text: "Download Cost Explorer reports as CSV files and parse them, using AWS Budgets for forecasts." },
      { id: "C", text: "Configure AWS Budgets to publish usage cost data to an Amazon SNS topic." },
      { id: "D", text: "Generate AWS Budgets reports and deliver them through an Amazon SQS queue." }
    ],
    correct: ["A"],
    explanation:
      "Cost Explorer exposes an API for both historical cost and usage data and for forecasting, at whatever granularity is needed, with pagination for large result sets. A tool can consume it directly with no files to move or parse.",
    whyWrong: {
      B: "Manually downloading and parsing CSVs is exactly the operational overhead an API removes, and it is not programmatic in any meaningful sense.",
      C: "Budgets notifies when a threshold is crossed; it is not a source of detailed cost and usage data.",
      D: "Budgets does not produce the detailed dataset the tool needs, and routing it through a queue does not change that."
    }
  },

  {
    id: "cost-032",
    domain: "Design Cost-Optimized Architectures",
    topic: "Lifecycle policies and archival",
    difficulty: "easy",
    type: "single",
    question:
      "Transaction logs are written to an S3 bucket and are only useful for troubleshooting during the month after they are created, after which they should be removed automatically. What should be configured?",
    options: [
      { id: "A", text: "An S3 Lifecycle rule with an expiration action that deletes objects 30 days after creation." },
      { id: "B", text: "A bucket policy that denies access to objects older than 30 days." },
      { id: "C", text: "An IAM policy that deletes objects older than 30 days." },
      { id: "D", text: "CORS configuration on the bucket to enable monthly deletion." }
    ],
    correct: ["A"],
    explanation:
      "Lifecycle configuration supports expiration actions, where S3 deletes objects on your behalf once they reach the specified age. It is the native mechanism for time-based deletion and requires no code.",
    whyWrong: {
      B: "A bucket policy controls access, not object lifetime; the objects would remain and keep costing money.",
      C: "IAM policies grant or deny permissions. They cannot perform actions such as deleting objects.",
      D: "CORS governs cross-origin browser requests and has nothing to do with retention."
    }
  },

  {
    id: "cost-033",
    domain: "Design Cost-Optimized Architectures",
    topic: "Data transfer and NAT cost",
    difficulty: "medium",
    type: "single",
    question:
      "EC2 instances are being moved into private subnets for compliance, and they exchange large volumes of data with Amazon S3 in the same Region. The company wants the lowest possible cost for this traffic. Which option should be chosen?",
    options: [
      { id: "A", text: "A gateway VPC endpoint for Amazon S3." },
      { id: "B", text: "An interface VPC endpoint for Amazon S3." },
      { id: "C", text: "A NAT gateway in a public subnet." },
      { id: "D", text: "A transit gateway routed to Amazon S3." }
    ],
    correct: ["A"],
    explanation:
      "Gateway endpoints for S3 carry no hourly charge and no per-GB processing charge, and they keep traffic on the AWS network. For in-Region S3 access from private subnets they are both the cheapest and the most private option.",
    whyWrong: {
      B: "Interface endpoints work and are private, but they bill per hour per endpoint and per GB processed, so they cost more than a gateway endpoint for the same traffic.",
      C: "A NAT gateway bills hourly even when idle plus per GB processed, making it the most expensive of the workable options.",
      D: "Transit Gateway connects VPCs and on-premises networks; S3 is not in a VPC, so it cannot be reached this way."
    }
  },

  /* ==========================================================
   * Batch 6 — written against a second failed practice set.
   * Concepts that were entirely missing from the bank:
   * Control Tower drift, Aurora Serverless ACUs, Lambda
   * SnapStart, Instance Scheduler, the AWS Load Balancer
   * Controller, Transit Gateway at scale, Cognito authorizers,
   * S3 Object Lock, Storage Lens and CloudFront TTLs.
   * ========================================================== */

  {
    id: "sec-042",
    domain: "Design Secure Architectures",
    topic: "Multi-account governance with Control Tower",
    difficulty: "medium",
    type: "single",
    question:
      "Accounts are grouped into organizational units in AWS Organizations. Stakeholders must be notified when the OU hierarchy changes — an account moved between OUs, or removed from one — and want to subscribe to those alerts. Which option meets this with the least administrative overhead?",
    options: [
      { id: "A", text: "Provision the accounts with AWS Control Tower and enable account drift notifications." },
      { id: "B", text: "Provision the accounts with AWS Control Tower and set up AWS Config aggregated rules." },
      { id: "C", text: "Create the accounts with AWS Service Catalog and configure a CloudTrail organization trail." },
      { id: "D", text: "Use CloudFormation StackSets across the organization and run drift detection on the stacks." }
    ],
    correct: ["A"],
    explanation:
      "Control Tower already watches for governance drift, and moving or removing an account from its OU is exactly what account drift means. Enabling drift notifications publishes those events for stakeholders to subscribe to, with nothing to build.",
    whyWrong: {
      B: "Config rules evaluate resource configuration across accounts. The OU hierarchy is an Organizations structure, not a resource configuration.",
      C: "An organization trail logs every API call in every account. Isolating OU-hierarchy changes from that volume means building the filtering and alerting yourself.",
      D: "StackSet drift detection compares deployed resources against their templates; it says nothing about where an account sits in the OU tree."
    }
  },

  {
    id: "sec-043",
    domain: "Design Secure Architectures",
    topic: "Multi-account governance with Control Tower",
    difficulty: "medium",
    type: "single",
    question:
      "A company with a handful of accounts wants a governed multi-account environment quickly: separate log archive and audit accounts, preventive and detective guardrails applied consistently, and a repeatable way for teams to request new compliant accounts. Which approach involves the least engineering?",
    options: [
      { id: "A", text: "Deploy AWS Control Tower, which builds the landing zone and provides Account Factory for new accounts." },
      { id: "B", text: "Build the landing zone by hand with Organizations, SCPs, a logging account and StackSets." },
      { id: "C", text: "Use AWS Config conformance packs deployed organization-wide." },
      { id: "D", text: "Use AWS Service Catalog products that each team launches into its own account." }
    ],
    correct: ["A"],
    explanation:
      "Control Tower orchestrates Organizations, Service Catalog and IAM Identity Center to stand up a landing zone — log archive and audit accounts, guardrails, and Account Factory for self-service provisioning — in about an hour, rather than as a build project.",
    whyWrong: {
      B: "This is exactly what Control Tower automates. Doing it by hand is a substantial project and drifts over time.",
      C: "Conformance packs give detective controls but no landing zone, no account structure and no provisioning path.",
      D: "Service Catalog distributes approved products; on its own it does not create the account structure or the guardrails."
    }
  },

  {
    id: "sec-044",
    domain: "Design Secure Architectures",
    topic: "VPC connectivity: peering, Transit Gateway and VPN",
    difficulty: "medium",
    type: "single",
    question:
      "A healthcare provider runs each application in its own isolated VPC. All of them must reach a central shared-services VPC and also communicate with each other, and dozens more application VPCs will be added over the next year. Which design minimises administrative overhead?",
    options: [
      { id: "A", text: "An AWS Transit Gateway attached to every VPC, with route tables directing traffic through the hub." },
      { id: "B", text: "VPC peering connections between the shared-services VPC and each application VPC, and between application VPCs." },
      { id: "C", text: "Site-to-Site VPN tunnels from each application VPC to the shared-services VPC." },
      { id: "D", text: "AWS Direct Connect between the application VPCs and the shared-services VPC." }
    ],
    correct: ["A"],
    explanation:
      "Transit Gateway is a hub: each VPC attaches once and can then reach any other attachment allowed by the route tables. Adding the fiftieth VPC is one attachment, whereas mesh approaches grow quadratically — which is precisely the overhead the requirement targets.",
    whyWrong: {
      B: "Peering is non-transitive, so every pair that must talk needs its own connection. Dozens of VPCs means hundreds of connections and route entries to maintain.",
      C: "VPN tunnels between VPCs add encryption overhead, throughput limits and per-tunnel management, and scale no better than peering.",
      D: "Direct Connect links on-premises networks to AWS. It is not a mechanism for VPC-to-VPC routing."
    }
  },

  {
    id: "sec-045",
    domain: "Design Secure Architectures",
    topic: "VPC connectivity: peering, Transit Gateway and VPN",
    difficulty: "medium",
    type: "single",
    question:
      "Two VPCs in the same Region must exchange traffic between a small number of instances. There is no requirement for transitive routing to other VPCs or on-premises networks, and the team wants the lowest cost. What should be used?",
    options: [
      { id: "A", text: "A VPC peering connection between the two VPCs, with routes added on both sides." },
      { id: "B", text: "A Transit Gateway with both VPCs attached." },
      { id: "C", text: "A Site-to-Site VPN between the two VPCs." },
      { id: "D", text: "A PrivateLink endpoint service in each VPC." }
    ],
    correct: ["A"],
    explanation:
      "For a simple pair of VPCs with no transitive requirement, peering is the right tool: there is no hourly charge for the connection itself, only data transfer, and the configuration is two route entries.",
    whyWrong: {
      B: "Transit Gateway bills per attachment per hour plus data processing. That overhead is worth paying at scale, not for a single pair.",
      C: "A VPN adds encryption processing and bandwidth limits for traffic that already stays on the AWS network.",
      D: "PrivateLink exposes a specific service endpoint rather than general connectivity between the VPCs."
    }
  },

  {
    id: "sec-046",
    domain: "Design Secure Architectures",
    topic: "Application authentication with Cognito",
    difficulty: "medium",
    type: "single",
    question:
      "An organisation exposes RESTful APIs through Amazon API Gateway to millions of end users. Users must sign in, and each API call must be verified against that sign-in. Which approach is the most operationally efficient?",
    options: [
      { id: "A", text: "Authenticate users with an Amazon Cognito user pool and attach a Cognito user pool authorizer to the API methods." },
      { id: "B", text: "Use an Amazon Cognito identity pool for federated identities and secure the API with an IAM authorizer." },
      { id: "C", text: "Write a Lambda authorizer that validates credentials on every request." },
      { id: "D", text: "Create an IAM user per end user and secure the API with an IAM authorizer." }
    ],
    correct: ["A"],
    explanation:
      "A user pool is a managed user directory that handles registration, sign-in and token issuance, and API Gateway has a built-in COGNITO_USER_POOLS authorizer that validates the resulting token on every call. It is configuration rather than code, and scales to millions of users.",
    whyWrong: {
      B: "Identity pools exchange an existing identity for temporary AWS credentials to call AWS services directly. They are not the authentication directory for API users.",
      C: "A Lambda authorizer is the right answer for a custom or third-party token scheme, but here it means writing, testing and operating code that the built-in authorizer already provides.",
      D: "IAM users are for workloads and staff, capped well below millions, and would be an unmanageable way to represent application end users."
    }
  },

  {
    id: "sec-047",
    domain: "Design Secure Architectures",
    topic: "Identity federation and IAM Identity Center",
    difficulty: "hard",
    type: "single",
    question:
      "A corporation is migrating applications to AWS across many accounts under Organizations. The security team must sign in with their existing on-premises Active Directory credentials, and user and group management must stay in that on-premises directory. Which approach meets this?",
    options: [
      { id: "A", text: "Enable IAM Identity Center, deploy AWS Managed Microsoft AD, and establish a two-way forest trust with the on-premises Active Directory." },
      { id: "B", text: "Create IAM users in each account mirroring the Active Directory user list." },
      { id: "C", text: "Use an Amazon Cognito user pool federated to Active Directory for console access." },
      { id: "D", text: "Deploy AWS Managed Microsoft AD and migrate all users and groups into it." }
    ],
    correct: ["A"],
    explanation:
      "A two-way forest trust between AWS Managed Microsoft AD and the on-premises forest lets AWS authenticate the existing accounts while the on-premises directory stays authoritative for users and groups. Identity Center then maps those directory groups to permission sets across every account.",
    whyWrong: {
      B: "Mirrored IAM users create a second identity store to keep in sync, with long-lived credentials, in every account.",
      C: "Cognito serves application end users, not workforce access to the AWS console and CLI.",
      D: "Migrating the users into AWS moves the source of truth, which the requirement explicitly forbids."
    }
  },

  {
    id: "sec-048",
    domain: "Design Secure Architectures",
    topic: "KMS key policies and grants",
    difficulty: "hard",
    type: "single",
    question:
      "A company must prevent accidental deletion of KMS keys and email administrators whenever someone attempts one. Deletion attempts should be reversed automatically. Which solution does this with the least operational overhead?",
    options: [
      { id: "A", text: "An EventBridge rule matching KMS key-deletion scheduling, targeting an SSM Automation runbook that cancels the pending deletion, plus an SNS topic for notification." },
      { id: "B", text: "An EventBridge rule targeting an AWS Config rule that reverses the deletion, plus an SNS topic." },
      { id: "C", text: "CloudTrail delivering to CloudWatch Logs with a metric filter on DeleteKey that triggers an SNS notification." },
      { id: "D", text: "A Lambda function that blocks key deletion, invoked by a CloudWatch alarm, plus an SNS topic." }
    ],
    correct: ["A"],
    explanation:
      "Scheduling a KMS key for deletion starts a waiting period rather than deleting immediately, which leaves room to cancel. EventBridge detects the event, an SSM Automation runbook cancels the pending deletion, and the same rule notifies through SNS — managed components, no custom code.",
    whyWrong: {
      B: "Config evaluates and reports compliance; it does not intercept or reverse an API action.",
      C: "This detects and notifies but never cancels the deletion, so the key still disappears after the waiting period.",
      D: "Nothing can block the API call itself, and a CloudWatch alarm on an API event is the wrong trigger — EventBridge matches events directly."
    }
  },

  {
    id: "sec-049",
    domain: "Design Secure Architectures",
    topic: "S3 access controls and Block Public Access",
    difficulty: "medium",
    type: "multi",
    question:
      "Nightly virtual machine backups are copied to Amazon S3. They must be protected against overwriting or deletion for 20 days, then removed automatically. Which TWO actions together meet this?",
    options: [
      { id: "A", text: "Create the bucket with S3 Object Lock enabled and set a 20-day default retention period." },
      { id: "B", text: "Add an S3 Lifecycle rule that expires the objects after 20 days." },
      { id: "C", text: "Create the bucket with S3 Object Lock enabled and apply a 20-day legal hold." },
      { id: "D", text: "Enable versioning on the bucket as a separate, explicit step." },
      { id: "E", text: "Tag each object so a retention policy can select it." }
    ],
    correct: ["A", "B"],
    explanation:
      "Object Lock with a retention period makes objects immutable for those 20 days — write-once-read-many, so nothing can overwrite or delete them. A lifecycle expiration rule then removes them once the retention has elapsed, which is what makes the deletion automatic.",
    whyWrong: {
      C: "A legal hold has no expiry — it stays until someone with permission removes it explicitly, so the backups would never age out on their own.",
      D: "Enabling Object Lock on a new bucket turns versioning on implicitly, so this is not a separate step.",
      E: "Every backup needs identical protection, so selective tagging adds machinery for no benefit."
    }
  },

  {
    id: "sec-050",
    domain: "Design Secure Architectures",
    topic: "Auditing with CloudTrail and Config",
    difficulty: "medium",
    type: "single",
    question:
      "A global company stores data across S3 buckets in several Regions and needs to identify every bucket that does not have versioning enabled, with recommendations on data protection. Which service reports this directly?",
    options: [
      { id: "A", text: "Amazon S3 Storage Lens." },
      { id: "B", text: "AWS CloudTrail events." },
      { id: "C", text: "IAM Access Analyzer." },
      { id: "D", text: "An S3 Multi-Region Access Point." }
    ],
    correct: ["A"],
    explanation:
      "Storage Lens gives organisation-wide visibility into S3 usage and configuration, including data-protection metrics such as which buckets lack versioning, together with recommendations — across accounts and Regions from one dashboard.",
    whyWrong: {
      B: "CloudTrail records API calls. It would show a bucket's versioning being changed but cannot report the current state of every bucket.",
      C: "Access Analyzer finds resources shared with external principals; it does not evaluate versioning.",
      D: "Multi-Region Access Points route requests to buckets across Regions. They are an access mechanism, not an analytics tool."
    }
  },

  {
    id: "res-040",
    domain: "Design Resilient Architectures",
    topic: "Load balancer selection",
    difficulty: "medium",
    type: "single",
    question:
      "Microservices run on an Amazon EKS cluster and requests must be routed to different services based on the URL path. Which option achieves this with the least setup?",
    options: [
      { id: "A", text: "Provision an Application Load Balancer through the AWS Load Balancer Controller add-on, driven by Kubernetes Ingress resources." },
      { id: "B", text: "Deploy an NGINX Ingress controller into the cluster." },
      { id: "C", text: "Provision a Network Load Balancer through the AWS Load Balancer Controller." },
      { id: "D", text: "Put an AWS Lambda function in front of the cluster to proxy requests." }
    ],
    correct: ["A"],
    explanation:
      "Path-based routing is a layer 7 function, which is what an ALB does. The AWS Load Balancer Controller is the supported EKS add-on that watches Ingress resources and provisions the ALB and its target groups automatically, so the setup is an add-on plus an Ingress manifest.",
    whyWrong: {
      B: "NGINX Ingress reaches the same outcome but you then own the controller pods, their scaling, upgrades and the load balancer in front of them.",
      C: "An NLB operates at layer 4 on IP and port. It cannot see URL paths.",
      D: "A Lambda proxy means writing routing logic by hand, and it still needs an ingress path into the cluster."
    }
  },

  {
    id: "res-041",
    domain: "Design Resilient Architectures",
    topic: "Load balancer selection",
    difficulty: "medium",
    type: "single",
    question:
      "A Kubernetes Service of type LoadBalancer on Amazon EKS must expose a TCP-based protocol to clients that require a static IP address per Availability Zone. Which load balancer should the AWS Load Balancer Controller provision?",
    options: [
      { id: "A", text: "A Network Load Balancer." },
      { id: "B", text: "An Application Load Balancer." },
      { id: "C", text: "A Gateway Load Balancer." },
      { id: "D", text: "A Classic Load Balancer." }
    ],
    correct: ["A"],
    explanation:
      "The requirements are layer 4 TCP and a static IP per Availability Zone, both of which are Network Load Balancer characteristics. The AWS Load Balancer Controller provisions an NLB for Services of type LoadBalancer, and an ALB for Ingress resources.",
    whyWrong: {
      B: "An ALB handles HTTP and HTTPS at layer 7 and has no static IP; it is what the controller provisions for Ingress, not for a TCP Service.",
      C: "Gateway Load Balancers insert third-party network appliances into the traffic path.",
      D: "The Classic Load Balancer is the previous generation and is not the controller's target for new workloads."
    }
  },

  {
    id: "res-042",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "medium",
    type: "single",
    question:
      "An API Gateway endpoint invokes a Lambda function that writes each 5 KB payload to Aurora. The endpoint only needs to acknowledge receipt, not completion, but throttling errors keep appearing and the concurrency limit has been raised repeatedly. What is the correct fix?",
    options: [
      { id: "A", text: "Split into two functions — one that accepts the request and writes to an SQS queue, and one triggered by the queue that persists to the database." },
      { id: "B", text: "Split into two functions and use Amazon SNS to signal the second function." },
      { id: "C", text: "Move the data store to DynamoDB with a DAX cluster in front of it." },
      { id: "D", text: "Rewrite the function as a Go application on EC2 using native database drivers." }
    ],
    correct: ["A"],
    explanation:
      "Because the caller only needs an acknowledgement, the write can be deferred. A queue absorbs bursts, so the accepting function returns immediately while the processing function drains the backlog at whatever rate its concurrency allows — and Lambda backs off and retries on throttling rather than failing the caller.",
    whyWrong: {
      B: "SNS pushes each message to subscribers with no durable buffer for a slow consumer, so bursts still overwhelm the processing function.",
      C: "DAX accelerates DynamoDB reads. The bottleneck here is concurrency on writes, which caching does not address.",
      D: "This abandons serverless for a server fleet, replacing one scaling problem with instance management."
    }
  },

  {
    id: "res-043",
    domain: "Design Resilient Architectures",
    topic: "Backup and restore with AWS Backup",
    difficulty: "medium",
    type: "single",
    question:
      "An operations team needs one place to schedule, monitor and report on backups of EC2 instances, EBS volumes, EFS file systems and DynamoDB tables, with a single retention policy applied to all of them. What should they use?",
    options: [
      { id: "A", text: "AWS Backup with a backup plan and resource assignments covering all four resource types." },
      { id: "B", text: "Amazon Data Lifecycle Manager policies for each resource type." },
      { id: "C", text: "A scheduled Lambda function calling each service's native snapshot API." },
      { id: "D", text: "AWS Config rules that create snapshots when resources drift." }
    ],
    correct: ["A"],
    explanation:
      "AWS Backup is the single control plane across those services: one backup plan defines the schedule, lifecycle and retention, and resource assignments select what it applies to, with centralised monitoring and reporting.",
    whyWrong: {
      B: "Data Lifecycle Manager covers EBS snapshots and AMIs only — EFS and DynamoDB fall outside it entirely.",
      C: "Bespoke scripting means owning scheduling, retries, retention and reporting for four different APIs.",
      D: "Config detects configuration drift; it is not a backup scheduler."
    }
  },

  {
    id: "res-044",
    domain: "Design Resilient Architectures",
    topic: "Fault isolation and blast radius",
    difficulty: "medium",
    type: "single",
    question:
      "A Lambda function reads from a queue and writes to an RDS database that supports a fixed number of connections. During spikes the function scales out far enough to exhaust the database's connections, taking down other applications that share it. Which control most directly prevents that?",
    options: [
      { id: "A", text: "Set reserved concurrency on the function so it can never exceed a safe number of simultaneous executions." },
      { id: "B", text: "Increase the function's memory so each invocation finishes sooner." },
      { id: "C", text: "Increase the account's concurrent execution limit." },
      { id: "D", text: "Add a dead-letter queue to the function." }
    ],
    correct: ["A"],
    explanation:
      "Reserved concurrency both guarantees and caps how many instances of a function can run at once. Capping it below the database's connection budget means the function can never exhaust the shared resource, no matter how deep the queue grows.",
    whyWrong: {
      B: "Faster invocations reduce how long each connection is held but place no ceiling on how many open at once.",
      C: "Raising the account limit lets the function scale further, making the exhaustion worse.",
      D: "A dead-letter queue captures messages that fail repeatedly; it does nothing to limit concurrency."
    }
  },

  {
    id: "res-045",
    domain: "Design Resilient Architectures",
    topic: "S3 durability and replication",
    difficulty: "medium",
    type: "single",
    question:
      "Objects are written to a bucket by an application in one Region. A second team in another Region needs read access to the same objects with low latency, and the copy must stay current automatically as new objects arrive. What should be configured?",
    options: [
      { id: "A", text: "S3 Cross-Region Replication into a bucket in the second Region, with versioning enabled on both." },
      { id: "B", text: "An S3 Multi-Region Access Point routing all reads back to the source bucket." },
      { id: "C", text: "A CloudFront distribution with the source bucket as origin." },
      { id: "D", text: "A nightly S3 Batch Operations copy job to the second Region." }
    ],
    correct: ["A"],
    explanation:
      "Cross-Region Replication copies new objects to the destination bucket automatically as they are written, giving the second team a local copy in their own Region. Versioning on both buckets is a prerequisite for replication.",
    whyWrong: {
      B: "A Multi-Region Access Point routes requests intelligently but does not by itself create a second copy — without replication, reads still travel to the source Region.",
      C: "CloudFront caches at edge locations and helps repeat reads, but the objects still originate from one Region and nothing is stored in the second.",
      D: "A nightly job leaves the copy up to a day stale, which fails the requirement to stay current automatically."
    }
  },

  {
    id: "perf-038",
    domain: "Design High-Performing Architectures",
    topic: "Aurora Serverless capacity planning",
    difficulty: "hard",
    type: "single",
    question:
      "A MySQL-compatible database is being moved from on-premises to a managed AWS service. Its memory consumption ranges from 2 GiB to 16 GiB, and application traffic is unpredictable with spikes and periods of no activity. Capacity must scale automatically. Which configuration fits?",
    options: [
      { id: "A", text: "Aurora Serverless v2 with a minimum of 1 and a maximum of 8 Aurora capacity units." },
      { id: "B", text: "Aurora Serverless v2 with a minimum of 2 and a maximum of 16 Aurora capacity units." },
      { id: "C", text: "Aurora with a memory-optimised provisioned DB instance class." },
      { id: "D", text: "Amazon RDS for MySQL sized with 4 GiB of memory." }
    ],
    correct: ["A"],
    explanation:
      "An Aurora capacity unit is roughly 2 GiB of memory plus the matching CPU and networking, so a 2–16 GiB range maps to 1–8 ACUs. Serverless v2 then scales within that band in fine increments, which suits traffic that spikes and falls to nothing.",
    whyWrong: {
      B: "This reads the GiB figures as if they were ACUs. 2–16 ACUs is 4–32 GiB, so the floor never scales down as far as it should and the ceiling is double what is needed.",
      C: "A provisioned instance class is a fixed size, which either over-provisions during quiet periods or under-provisions during spikes.",
      D: "RDS for MySQL has fixed compute and memory too, and 4 GiB is below the workload's 16 GiB peak."
    }
  },

  {
    id: "perf-039",
    domain: "Design High-Performing Architectures",
    topic: "Aurora Serverless capacity planning",
    difficulty: "medium",
    type: "single",
    question:
      "An Aurora Serverless v2 cluster is configured with a minimum of 8 ACUs. The workload is idle overnight, yet the bill shows steady charges through those hours. What explains this and what should change?",
    options: [
      { id: "A", text: "The minimum capacity sets a floor the cluster never scales below; lower the minimum so it can scale down when idle." },
      { id: "B", text: "Serverless v2 always bills the maximum capacity; lower the maximum." },
      { id: "C", text: "Serverless v2 cannot scale down at all; migrate to a provisioned instance and stop it overnight." },
      { id: "D", text: "Storage charges dominate; enable a lifecycle policy on the cluster volume." }
    ],
    correct: ["A"],
    explanation:
      "Serverless v2 bills for the capacity actually in use, but never scales below the configured minimum. A minimum of 8 ACUs means roughly 16 GiB of memory is held and billed continuously, so the floor is what to lower.",
    whyWrong: {
      B: "The maximum is a ceiling, not a billing basis; capacity is billed as consumed between the floor and ceiling.",
      C: "Scaling down is exactly what Serverless v2 does — down to the configured minimum.",
      D: "Storage is billed separately by volume and has no lifecycle policy; it does not explain steady compute charges."
    }
  },

  {
    id: "perf-040",
    domain: "Design High-Performing Architectures",
    topic: "Serverless compute with Lambda",
    difficulty: "hard",
    type: "single",
    question:
      "A team is moving container-based Java services to AWS Lambda but is concerned about cold starts and tail latency. Invocation volume is uneven, with long quiet periods. Which option minimises cold starts most cost-effectively?",
    options: [
      { id: "A", text: "Enable Lambda SnapStart." },
      { id: "B", text: "Enable provisioned concurrency on the function." },
      { id: "C", text: "Configure response streaming on the function." },
      { id: "D", text: "Move dependencies into Lambda layers." }
    ],
    correct: ["A"],
    explanation:
      "SnapStart takes an encrypted snapshot of the initialised execution environment when a version is published and restores from that cache on invocation, so the expensive JVM initialisation is skipped. There is no charge for idle capacity, which matters when the function is quiet for long stretches.",
    whyWrong: {
      B: "Provisioned concurrency removes cold starts by keeping environments warm, but you pay for that capacity continuously — poor value when invocations drop to zero for long periods.",
      C: "Response streaming improves time to first byte for large responses. It does nothing about initialisation time, which is what dominates here.",
      D: "Layers help with packaging and reuse; they may trim startup slightly but do not address JVM initialisation."
    }
  },

  {
    id: "perf-041",
    domain: "Design High-Performing Architectures",
    topic: "Serverless compute with Lambda",
    difficulty: "medium",
    type: "single",
    question:
      "A Python Lambda function behind a customer-facing API must never serve a cold start during business hours, when traffic is steady and predictable. Cost outside those hours is not a concern because the function is barely invoked. What should be configured?",
    options: [
      { id: "A", text: "Provisioned concurrency, scheduled to apply during business hours via Application Auto Scaling." },
      { id: "B", text: "Lambda SnapStart on the function." },
      { id: "C", text: "Reserved concurrency set to the expected peak." },
      { id: "D", text: "A larger memory allocation." }
    ],
    correct: ["A"],
    explanation:
      "Provisioned concurrency keeps a set number of environments initialised and ready, which is the only way to guarantee no cold start. Scheduling it through Application Auto Scaling means paying for warm capacity only during the hours that need it.",
    whyWrong: {
      B: "SnapStart is a Java runtime feature; it does not apply to a Python function.",
      C: "Reserved concurrency caps and guarantees how many executions may run concurrently. It pre-initialises nothing, so cold starts remain.",
      D: "More memory speeds execution and can shorten initialisation slightly, but it does not eliminate cold starts."
    }
  },

  {
    id: "perf-042",
    domain: "Design High-Performing Architectures",
    topic: "CloudFront and content delivery",
    difficulty: "medium",
    type: "single",
    question:
      "A high-traffic static site on S3 behind CloudFront has its default TTL set to 10 seconds, so almost nothing is cached. The company wants real caching but must not serve stale content for more than a few minutes after a deployment. What should be configured?",
    options: [
      { id: "A", text: "Raise the CloudFront default TTL to about 4 minutes and set Cache-Control headers on the S3 objects to match." },
      { id: "B", text: "Set a default TTL of 4 minutes on the S3 bucket." },
      { id: "C", text: "Add a Lambda@Edge function on viewer response that injects an Expires header." },
      { id: "D", text: "Use an S3 Lifecycle policy that deletes objects older than 7 days so edge caches are purged." }
    ],
    correct: ["A"],
    explanation:
      "Cache duration is governed by the distribution's TTL settings together with the origin's Cache-Control headers. Setting both to a few minutes gives genuine caching while bounding how long a deployment can go unnoticed — and an invalidation can still flush immediately when needed.",
    whyWrong: {
      B: "S3 has no TTL setting. Cache behaviour is expressed through object headers and the CloudFront distribution.",
      C: "Lambda@Edge could inject headers, but it adds an execution on every response to do what the distribution and origin headers already do.",
      D: "Lifecycle policies delete objects from the bucket. They neither expire CloudFront's cache nor relate to content freshness."
    }
  },

  {
    id: "perf-043",
    domain: "Design High-Performing Architectures",
    topic: "Data transfer and migration services",
    difficulty: "hard",
    type: "single",
    question:
      "An on-premises SMB file server holds large files that are accessed heavily for their first 10 days and then effectively never — though they must remain retrievable within 12 hours. The company wants the storage moved to AWS while the application keeps using an SMB share. Which solution fits?",
    options: [
      { id: "A", text: "Deploy an Amazon S3 File Gateway and apply an S3 Lifecycle rule transitioning objects to S3 Glacier Deep Archive after 10 days." },
      { id: "B", text: "Deploy an Amazon FSx File Gateway and apply an S3 Lifecycle rule transitioning objects to Glacier Deep Archive after 10 days." },
      { id: "C", text: "Give users direct access to Amazon S3 and transition objects to Glacier Flexible Retrieval after 10 days." },
      { id: "D", text: "Run an AWS DataSync task that transfers files older than 10 days to AWS." }
    ],
    correct: ["A"],
    explanation:
      "S3 File Gateway presents an SMB or NFS share on premises while storing the data as S3 objects, so the application is unchanged and lifecycle rules apply. Deep Archive is the cheapest class whose standard retrieval completes within 12 hours, which is exactly the stated tolerance.",
    whyWrong: {
      B: "FSx File Gateway provides low-latency access to Amazon FSx file systems, not to S3, so S3 lifecycle rules do not apply to it.",
      C: "S3 is object storage and cannot be mounted as an SMB share, and Glacier Flexible Retrieval costs more than Deep Archive for a 12-hour tolerance.",
      D: "DataSync transfers data on a schedule but cannot select files by age, and it leaves the application without its SMB share."
    }
  },

  {
    id: "cost-034",
    domain: "Design Cost-Optimized Architectures",
    topic: "Environment scheduling and idle resources",
    difficulty: "medium",
    type: "single",
    question:
      "An internal application runs on EC2 with an Amazon RDS for PostgreSQL database, and is used only during working hours on weekdays. The company wants to cut cost with minimal operational overhead. Which solution fits best?",
    options: [
      { id: "A", text: "Deploy the Instance Scheduler on AWS solution and configure start and stop schedules for the EC2 and RDS instances." },
      { id: "B", text: "Purchase Reserved Instances for both EC2 and RDS." },
      { id: "C", text: "Purchase a Compute Savings Plan covering EC2 and RDS." },
      { id: "D", text: "Create a CloudWatch alarm on low CPU that invokes a Lambda function to stop the instances." }
    ],
    correct: ["A"],
    explanation:
      "Instance Scheduler on AWS is a published CloudFormation solution that starts and stops EC2 and RDS instances on a schedule you define. For a weekday, working-hours application it removes roughly two-thirds of the running hours, and it is deployed rather than built.",
    whyWrong: {
      B: "Reserved Instances commit to paying around the clock, which forfeits the benefit for something running about 50 hours a week.",
      C: "Savings Plans likewise assume continuous usage, and Compute Savings Plans do not apply to RDS instances at all.",
      D: "Stopping on low CPU is a proxy for a schedule and a dangerous one — a quiet mid-morning could shut the database down during working hours."
    }
  },

  {
    id: "cost-035",
    domain: "Design Cost-Optimized Architectures",
    topic: "EBS snapshot and volume cost",
    difficulty: "medium",
    type: "multi",
    question:
      "A cost report shows a sharp rise in spending on io2 Block Express volumes attached to production instances. The team wants to right-size the volumes using real usage data, without application downtime. Which TWO actions achieve this?",
    options: [
      { id: "A", text: "Review IOPS and throughput metrics for the volumes with CloudWatch." },
      { id: "B", text: "Change volume size, type or provisioned performance with the EC2 ModifyVolume operation." },
      { id: "C", text: "Lower EBS performance through the EC2 ModifyInstanceAttribute operation." },
      { id: "D", text: "Apply an S3 Lifecycle policy to archive infrequently accessed backups." },
      { id: "E", text: "Create a CloudWatch billing alarm for EBS charges." }
    ],
    correct: ["A", "B"],
    explanation:
      "Right-sizing needs evidence and then a change. CloudWatch exposes the per-volume IOPS and throughput actually consumed, which shows how much provisioned performance is being paid for and not used. Elastic Volumes then applies the change through ModifyVolume while the volume stays attached and in service.",
    whyWrong: {
      C: "Instance attributes govern the instance, not the provisioned performance of an attached EBS volume.",
      D: "S3 lifecycle rules apply to objects in S3 and have no effect on EBS spending.",
      E: "A billing alarm reports that costs rose. It provides no per-volume evidence and changes nothing."
    }
  },

  {
    id: "cost-036",
    domain: "Design Cost-Optimized Architectures",
    topic: "Right-sizing and cost visibility",
    difficulty: "medium",
    type: "single",
    question:
      "A finance team wants to be alerted when spending on any service deviates from its normal pattern — for example a service that suddenly costs several times its usual daily amount — without setting a fixed threshold per service. Which option meets this?",
    options: [
      { id: "A", text: "Create a cost monitor with AWS Cost Anomaly Detection and subscribe the team to its alerts." },
      { id: "B", text: "Create a zero-spend budget template in AWS Budgets." },
      { id: "C", text: "Use Cost Explorer with multi-year data at monthly granularity." },
      { id: "D", text: "Create a CloudWatch alarm on the EstimatedCharges metric." }
    ],
    correct: ["A"],
    explanation:
      "Cost Anomaly Detection applies machine learning to each monitored dimension's spending history, accounting for seasonality and growth, and alerts only when actual spend deviates meaningfully. That is what removes the need for a hand-set threshold per service.",
    whyWrong: {
      B: "A zero-spend budget alerts when spending exceeds the Free Tier. It is a fixed threshold and unrelated to anomaly detection.",
      C: "Cost Explorer is for analysis after the fact and does not alert.",
      D: "An EstimatedCharges alarm fires on a fixed dollar threshold and cannot distinguish an anomaly from ordinary growth."
    }
  },

  /* ==========================================================
   * Batch 7 — concepts that recur across the practice material:
   * Aurora endpoints and global databases, Object Lock modes,
   * signed cookies, KMS custom key stores, Redis AUTH, Artifact,
   * SAML federation, scaling policy selection and migration.
   * ========================================================== */

  {
    id: "sec-051",
    domain: "Design Secure Architectures",
    topic: "S3 access controls and Block Public Access",
    difficulty: "hard",
    type: "single",
    question:
      "Clinical trial records must be stored in S3 so that no object can be overwritten or deleted for one year — including by the account's root user. Which configuration meets this?",
    options: [
      { id: "A", text: "S3 Object Lock in compliance mode with a one-year retention period." },
      { id: "B", text: "S3 Object Lock in governance mode with a one-year retention period." },
      { id: "C", text: "S3 Object Lock in compliance mode with a one-year legal hold." },
      { id: "D", text: "S3 Versioning with MFA Delete enabled on the bucket." }
    ],
    correct: ["A"],
    explanation:
      "Compliance mode is the only Object Lock mode that no one can override — not an administrator, not the root user. The retention period cannot be shortened and the mode cannot be changed for the duration, which is exactly what \"including the root user\" requires.",
    whyWrong: {
      B: "Governance mode can be bypassed by a principal holding s3:BypassGovernanceRetention, and the root user has it. It is for testing retention settings or protecting against accidents, not regulators.",
      C: "A legal hold has no duration — you cannot set it for one year. It stays until someone with permission removes it, so it neither expires nor satisfies a fixed one-year requirement.",
      D: "MFA Delete raises the bar for deletion but does not make objects immutable, and someone with the MFA device can still delete."
    }
  },

  {
    id: "sec-052",
    domain: "Design Secure Architectures",
    topic: "KMS key policies and grants",
    difficulty: "hard",
    type: "single",
    question:
      "A regulated business must encrypt data at rest with keys whose material it controls entirely, must be able to remove the key material from AWS KMS immediately, and must audit key usage independently of AWS CloudTrail. Which option meets all three?",
    options: [
      { id: "A", text: "Create a KMS key in a custom key store backed by an AWS CloudHSM cluster." },
      { id: "B", text: "Create a customer managed KMS key with automatic annual rotation enabled." },
      { id: "C", text: "Use an AWS managed key and store a copy of the material in AWS CloudHSM." },
      { id: "D", text: "Create a KMS key in a custom key store and hold the key material in Amazon S3." }
    ],
    correct: ["A"],
    explanation:
      "A custom key store backs KMS with a CloudHSM cluster you own. The key material is generated and stays in your HSMs, you can disconnect the store to make it immediately unusable, and because the HSMs are yours, CloudHSM audit logs give you key-usage auditing independent of CloudTrail.",
    whyWrong: {
      B: "A standard customer managed key is stored in KMS's own HSMs. You control policy and rotation, but not the hardware, and auditing is through CloudTrail only.",
      C: "AWS managed keys are controlled by AWS, and their material cannot be exported to or held in CloudHSM.",
      D: "Key material is never stored in S3 — a custom key store is backed by CloudHSM, and putting key material in object storage would defeat the point."
    }
  },

  {
    id: "sec-053",
    domain: "Design Secure Architectures",
    topic: "S3 encryption options",
    difficulty: "hard",
    type: "single",
    question:
      "A medical system must store records in S3 under a rule that neither the master key nor any unencrypted data may ever be transmitted to AWS. Which encryption approach satisfies this?",
    options: [
      { id: "A", text: "Client-side encryption using a client-side master key that never leaves the application." },
      { id: "B", text: "Client-side encryption using an AWS KMS key." },
      { id: "C", text: "Server-side encryption with a customer-provided key (SSE-C)." },
      { id: "D", text: "Server-side encryption with an AWS KMS key (SSE-KMS)." }
    ],
    correct: ["A"],
    explanation:
      "Only client-side encryption with a client-side master key keeps both conditions. The data is encrypted before it leaves the application, so AWS never sees plaintext, and the master key is held entirely by the client, so it is never sent either.",
    whyWrong: {
      B: "Client-side encryption with a KMS key keeps plaintext data local, but the key identifier is sent to KMS and the key lives in AWS — the master key requirement fails.",
      C: "With SSE-C you transmit the key with every request, and S3 performs the encryption, meaning plaintext reaches AWS too.",
      D: "SSE-KMS sends plaintext to S3 for encryption and the key is managed by AWS, failing both conditions."
    }
  },

  {
    id: "sec-054",
    domain: "Design Secure Architectures",
    topic: "Identity federation and IAM Identity Center",
    difficulty: "medium",
    type: "single",
    question:
      "Architects at a pharmaceutical company must access AWS resources using their existing on-premises Active Directory credentials. The identity provider supports SAML 2.0, and creating IAM users per person is unacceptable. What should be configured?",
    options: [
      { id: "A", text: "SAML 2.0-based federation with Active Directory Federation Services as the identity provider." },
      { id: "B", text: "Web identity federation with a public provider such as Google or Facebook." },
      { id: "C", text: "IAM users mirroring the Active Directory account list." },
      { id: "D", text: "An Amazon Cognito identity pool federated to the directory." }
    ],
    correct: ["A"],
    explanation:
      "AD FS speaks SAML 2.0, and AWS supports SAML federation directly: users authenticate against the corporate directory and receive temporary credentials for an IAM role. No IAM users are created and the directory stays the source of truth.",
    whyWrong: {
      B: "Web identity federation is for public consumer identity providers, not a corporate Active Directory.",
      C: "This creates the per-person IAM users the requirement forbids, plus a second credential store to synchronise.",
      D: "Cognito serves application end users; workforce console and CLI access goes through SAML federation or Identity Center."
    }
  },

  {
    id: "sec-055",
    domain: "Design Secure Architectures",
    topic: "Secrets management and rotation",
    difficulty: "medium",
    type: "single",
    question:
      "A Lambda function holds database and third-party API credentials in environment variables. Other developers with console access must not be able to read them in plain text. What provides the strongest protection?",
    options: [
      { id: "A", text: "Create a customer managed KMS key and use the console's encryption helpers to encrypt the variables with it." },
      { id: "B", text: "Nothing — Lambda already encrypts environment variables at rest by default." },
      { id: "C", text: "Enable TLS on the function's outbound connections." },
      { id: "D", text: "Move the function to an EC2 instance and store the values in a local configuration file." }
    ],
    correct: ["A"],
    explanation:
      "Lambda encrypts environment variables at rest with a default key, but anyone with console access to the function still sees the decrypted values. Encrypting with your own KMS key through the encryption helpers means the console shows ciphertext, and only principals granted Decrypt on that key can read them.",
    whyWrong: {
      B: "The default encryption protects the data at rest but not from colleagues viewing the function configuration — which is precisely the stated threat.",
      C: "TLS protects credentials in transit and does nothing about who can read them in the console.",
      D: "A file on an instance is readable by anyone with access to the instance and abandons the serverless model."
    }
  },

  {
    id: "sec-056",
    domain: "Design Secure Architectures",
    topic: "Auditing with CloudTrail and Config",
    difficulty: "easy",
    type: "single",
    question:
      "An audit team needs AWS's SOC and PCI compliance reports, plus agreements such as the Business Associate Addendum, for the company's account. Where should the architect get them?",
    options: [
      { id: "A", text: "AWS Artifact." },
      { id: "B", text: "AWS Security Hub." },
      { id: "C", text: "Amazon Inspector." },
      { id: "D", text: "AWS Identity and Access Management." }
    ],
    correct: ["A"],
    explanation:
      "AWS Artifact is the self-service portal for AWS's own compliance artefacts — SOC reports, PCI attestations, ISO certifications and agreements such as the BAA and NDA. It is the only place these documents are published.",
    whyWrong: {
      B: "Security Hub aggregates security findings about your own resources; it does not host AWS's audit reports.",
      C: "Inspector assesses your workloads for vulnerabilities and has nothing to do with AWS's certifications.",
      D: "IAM controls access to resources; it neither stores nor generates compliance reports."
    }
  },

  {
    id: "sec-057",
    domain: "Design Secure Architectures",
    topic: "Cross-account access with IAM roles",
    difficulty: "medium",
    type: "multi",
    question:
      "An organization wants to procure resources such as Transit Gateways, License Manager configurations and Route 53 Resolver rules centrally and share them across its many AWS accounts, without duplicating them. Which TWO services accomplish this?",
    options: [
      { id: "A", text: "AWS Organizations, to consolidate the accounts into one organization." },
      { id: "B", text: "AWS Resource Access Manager, to share the resources with those accounts." },
      { id: "C", text: "AWS Control Tower, to share the resources across accounts." },
      { id: "D", text: "IAM cross-account roles configured individually in every account." },
      { id: "E", text: "AWS ParallelCluster, to consolidate the accounts." }
    ],
    correct: ["A", "B"],
    explanation:
      "Organizations provides the account structure and the boundary within which sharing is trusted. Resource Access Manager then shares specific resource types — Transit Gateways, subnets, License Manager configurations, Resolver rules — with accounts or organizational units, so they are created once and used everywhere.",
    whyWrong: {
      C: "Control Tower sets up and governs a landing zone. Sharing individual resources across accounts is RAM's job.",
      D: "Hand-built cross-account roles in every account is the operational burden RAM exists to remove, and it does not share resource types like Transit Gateways.",
      E: "ParallelCluster is an HPC cluster management tool and is unrelated to account consolidation."
    }
  },

  {
    id: "sec-058",
    domain: "Design Secure Architectures",
    topic: "Edge protection with WAF and Shield",
    difficulty: "medium",
    type: "single",
    question:
      "SQL injection attempts are hitting Application Load Balancers in several AWS accounts. The team needs immediate protection and wants one place to define and reuse the rules across every account. What should be implemented?",
    options: [
      { id: "A", text: "AWS WAF with the SQL database managed rule group on each ALB, administered centrally through AWS Firewall Manager." },
      { id: "B", text: "Amazon GuardDuty with a managed rule blocking SQL injection, shared through Security Hub." },
      { id: "C", text: "AWS Network Firewall with stateful rule groups in front of each ALB." },
      { id: "D", text: "Amazon Macie to scan for the vulnerability, followed by refactoring the applications." }
    ],
    correct: ["A"],
    explanation:
      "The AWS Managed Rules SQL database rule group blocks request patterns associated with SQL injection and attaches directly to an ALB. Firewall Manager then defines the policy once at the organization level and enforces it on load balancers across every account.",
    whyWrong: {
      B: "GuardDuty detects threats from log analysis; it cannot attach rules to an ALB or block requests.",
      C: "Network Firewall protects VPC traffic and is not the layer that inspects HTTP requests reaching a load balancer.",
      D: "Macie classifies sensitive data in S3, and refactoring the applications takes far too long for an active attack."
    }
  },

  {
    id: "res-046",
    domain: "Design Resilient Architectures",
    topic: "Multi-AZ vs multi-Region design",
    difficulty: "hard",
    type: "single",
    question:
      "A relational workload needs cross-Region disaster recovery with an RPO of roughly one second and an RTO under one minute, managed by AWS rather than the application. Which data tier should be selected?",
    options: [
      { id: "A", text: "Amazon Aurora Global Database." },
      { id: "B", text: "Amazon RDS for PostgreSQL with a cross-Region read replica." },
      { id: "C", text: "Amazon DynamoDB global tables." },
      { id: "D", text: "Amazon RDS Multi-AZ with automated backups copied cross-Region." }
    ],
    correct: ["A"],
    explanation:
      "Aurora Global Database replicates at the storage layer with typical cross-Region lag under a second, and a secondary Region can be promoted in well under a minute. That combination of RPO and RTO, with AWS managing the replication, is what the requirement describes.",
    whyWrong: {
      B: "Cross-Region read replicas replicate asynchronously at the logical level with higher, more variable lag, and promotion takes several minutes.",
      C: "Global tables meet the replication targets but are non-relational, so they do not fit a relational workload.",
      D: "Multi-AZ protects against Availability Zone loss only, and restoring cross-Region backups takes hours."
    }
  },

  {
    id: "perf-051",
    domain: "Design High-Performing Architectures",
    topic: "Aurora endpoints and read scaling",
    difficulty: "medium",
    type: "single",
    question:
      "An Aurora cluster contains instances of different sizes. Production traffic must be routed to the high-capacity instances while internal reporting queries go to the low-capacity ones. What should be configured?",
    options: [
      { id: "A", text: "Two custom endpoints, one associated with the high-capacity instances and one with the low-capacity instances." },
      { id: "B", text: "The cluster endpoint for production traffic and the instance endpoint for reporting." },
      { id: "C", text: "The reader endpoint for both, letting Aurora load balance across all replicas." },
      { id: "D", text: "Nothing — Aurora routes heavy traffic to larger instances automatically." }
    ],
    correct: ["A"],
    explanation:
      "Custom endpoints load balance across a subset of instances that you define by criteria other than read/write role — such as instance class. Defining one for the high-capacity instances and another for the low-capacity ones gives each workload its own connection target.",
    whyWrong: {
      B: "The cluster endpoint always points at the writer, and an instance endpoint targets exactly one instance with no load balancing or failover.",
      C: "The reader endpoint spreads connections across all replicas indiscriminately, so reporting queries would land on the production instances.",
      D: "Aurora has no notion of which traffic is 'production'; endpoint selection is how you express that."
    }
  },

  {
    id: "res-048",
    domain: "Design Resilient Architectures",
    topic: "S3 durability and replication",
    difficulty: "medium",
    type: "multi",
    question:
      "After an engineer accidentally deleted objects from a production bucket, the team must protect against both accidental deletion and overwriting. Which TWO settings together achieve this?",
    options: [
      { id: "A", text: "Enable S3 Versioning on the bucket." },
      { id: "B", text: "Enable MFA Delete on the bucket." },
      { id: "C", text: "Serve all objects through pre-signed URLs only." },
      { id: "D", text: "Attach a bucket policy denying s3:DeleteObject to everyone." },
      { id: "E", text: "Move the objects to S3 Intelligent-Tiering." }
    ],
    correct: ["A", "B"],
    explanation:
      "Versioning keeps every variant of an object, so an overwrite creates a new version and a delete only adds a delete marker — both are recoverable. MFA Delete adds a second factor before anyone can permanently remove a version or change the versioning state.",
    whyWrong: {
      C: "Pre-signed URLs grant temporary access to an object; they do not prevent an authorised principal from deleting it.",
      D: "A blanket deny blocks legitimate deletions too. The goal is preventing accidents, not removing the capability.",
      E: "Intelligent-Tiering optimises storage cost by access pattern and offers no protection against deletion."
    }
  },

  {
    id: "res-049",
    domain: "Design Resilient Architectures",
    topic: "Event-driven patterns with EventBridge",
    difficulty: "medium",
    type: "single",
    question:
      "When a vehicle listing is deleted from an Aurora MySQL table, the record must be forwarded to a distributed processing system. Which approach captures that row-level change?",
    options: [
      { id: "A", text: "Use an Aurora MySQL native function to invoke a Lambda function on delete, and have it publish to an SQS queue." },
      { id: "B", text: "Create an RDS event subscription to SNS, fanning out to SQS queues processed by Lambda." },
      { id: "C", text: "Create an RDS event subscription targeting Lambda directly, which fans out to SQS." },
      { id: "D", text: "Create an RDS event subscription to SQS, which fans out to SNS topics." }
    ],
    correct: ["A"],
    explanation:
      "RDS event subscriptions report operational events about the instance — failovers, backups, configuration changes — not changes to rows. Aurora MySQL can invoke a Lambda function directly from a stored procedure or trigger, which is how you react to a specific row being deleted.",
    whyWrong: {
      B: "RDS events are instance-level notifications; a deleted row never generates one.",
      C: "Same limitation — the subscription would never fire for a data change, regardless of its target.",
      D: "Besides the same problem, SQS queues do not fan out to SNS topics; the relationship runs the other way."
    }
  },

  {
    id: "res-050",
    domain: "Design Resilient Architectures",
    topic: "Auto Scaling and health checks",
    difficulty: "hard",
    type: "single",
    question:
      "An Auto Scaling group spans three Availability Zones with default settings. A scale-in event is triggered. Which instance does the group terminate first?",
    options: [
      { id: "A", text: "In the Availability Zone with the most instances, the one launched from the oldest launch template." },
      { id: "B", text: "The instance that has been running the longest, regardless of zone." },
      { id: "C", text: "The instance with the fewest active user sessions." },
      { id: "D", text: "An instance chosen entirely at random." }
    ],
    correct: ["A"],
    explanation:
      "The default termination policy first rebalances across Availability Zones by choosing the zone with the most instances, then within that zone selects instances using the oldest launch template or configuration. Randomness only breaks a final tie.",
    whyWrong: {
      B: "Uptime is not the criterion — a long-running instance on the newest template in a sparse zone is not chosen first.",
      C: "Auto Scaling has no visibility into application sessions; that is why connection draining and lifecycle hooks exist.",
      D: "Random selection is the last tie-breaker, not the first rule."
    }
  },

  {
    id: "res-051",
    domain: "Design Resilient Architectures",
    topic: "Backup and restore with AWS Backup",
    difficulty: "medium",
    type: "single",
    question:
      "A compliance rule requires 90 days of daily backups for an Amazon Aurora cluster. What is the simplest way to meet it?",
    options: [
      { id: "A", text: "Create an AWS Backup plan taking daily snapshots with a 90-day retention period." },
      { id: "B", text: "Configure RDS automated backups with a 90-day retention period." },
      { id: "C", text: "Schedule a Lambda function to copy the automated snapshot to S3 daily and archive to Glacier after 90 days." },
      { id: "D", text: "Export automated snapshots to S3 automatically and expire them with a lifecycle rule." }
    ],
    correct: ["A"],
    explanation:
      "RDS automated backups cap out at 35 days of retention, so a 90-day requirement cannot be met that way. An AWS Backup plan schedules the snapshots and applies whatever retention you specify, with central monitoring and reporting.",
    whyWrong: {
      B: "The maximum retention for RDS automated backups is 35 days — well short of 90.",
      C: "Automated snapshots cannot be downloaded or copied to S3 directly; they must first be copied into manual snapshots, and the custom pipeline is unnecessary work.",
      D: "There is no automatic export of automated snapshots to S3; exporting is a manual operation on a manual snapshot."
    }
  },

  {
    id: "res-052",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "easy",
    type: "single",
    question:
      "An order-processing system on a standard SQS queue occasionally processes the same order twice, and ordering matters for a given customer account. What should be changed?",
    options: [
      { id: "A", text: "Move to an SQS FIFO queue, which provides exactly-once processing and ordering within a message group." },
      { id: "B", text: "Increase the queue's message retention period." },
      { id: "C", text: "Increase the maximum message size." },
      { id: "D", text: "Shorten the visibility timeout so messages are retried sooner." }
    ],
    correct: ["A"],
    explanation:
      "Standard queues give at-least-once delivery and best-effort ordering, which is exactly the behaviour producing duplicates and out-of-order processing. FIFO queues deduplicate within a five-minute window and preserve order within each message group.",
    whyWrong: {
      B: "Retention controls how long an unconsumed message survives and has no bearing on duplicates or ordering.",
      C: "Message size is unrelated to delivery semantics.",
      D: "A shorter visibility timeout makes redelivery more likely while processing is still in flight, increasing duplicates."
    }
  },

  {
    id: "perf-044",
    domain: "Design High-Performing Architectures",
    topic: "Read scaling with ElastiCache",
    difficulty: "medium",
    type: "single",
    question:
      "A banking portal uses ElastiCache for Redis for session state. Engineers must authenticate with a password before running Redis commands, and the credential must be long-lived. What should be configured?",
    options: [
      { id: "A", text: "Create the Redis cluster with --transit-encryption-enabled and --auth-token to require Redis AUTH." },
      { id: "B", text: "Enable at-rest encryption on the replication group." },
      { id: "C", text: "Enable in-transit encryption on its own." },
      { id: "D", text: "Generate an IAM authentication token from AWS credentials and use it as the password." }
    ],
    correct: ["A"],
    explanation:
      "Redis AUTH requires a password before commands are accepted, and ElastiCache requires in-transit encryption to be enabled alongside it so the token is not sent in clear text. The two parameters are set together at cluster creation.",
    whyWrong: {
      B: "At-rest encryption protects the stored data on disk and imposes no authentication on connecting clients.",
      C: "In-transit encryption protects the channel but does not require a password, so any client that can reach the endpoint can issue commands.",
      D: "IAM authentication tokens for ElastiCache expire after a short period, which conflicts with the long-lived credential requirement here."
    }
  },

  {
    id: "perf-045",
    domain: "Design High-Performing Architectures",
    topic: "CloudFront and content delivery",
    difficulty: "hard",
    type: "single",
    question:
      "A subscription site serves many private media files through CloudFront and must restrict them to paying members. The existing URLs must not change. Which mechanism fits?",
    options: [
      { id: "A", text: "CloudFront signed cookies, set for members after they authenticate." },
      { id: "B", text: "CloudFront signed URLs generated for each file." },
      { id: "C", text: "Field-level encryption on the distribution." },
      { id: "D", text: "Setting the origin protocol policy to Match Viewer." }
    ],
    correct: ["A"],
    explanation:
      "Signed cookies and signed URLs grant the same controlled access, but cookies are the choice when you need to authorise many files at once and cannot change the URLs — the browser presents the cookie on every request to the distribution.",
    whyWrong: {
      B: "Signed URLs authorise one file each and rewrite the URL, which the requirement rules out.",
      C: "Field-level encryption protects specific form fields submitted by viewers; it does not restrict who may download content.",
      D: "Match Viewer controls whether CloudFront contacts the origin over HTTP or HTTPS and has nothing to do with authorisation."
    }
  },

  {
    id: "perf-046",
    domain: "Design High-Performing Architectures",
    topic: "DynamoDB performance and caching",
    difficulty: "hard",
    type: "single",
    question:
      "A DynamoDB table throttles writes even though overall provisioned capacity is barely used. Analysis shows most writes concentrate on a handful of partition key values. What is the correct design change?",
    options: [
      { id: "A", text: "Choose a partition key with high cardinality so requests spread across many partitions." },
      { id: "B", text: "Choose a partition key with low cardinality to keep related items together." },
      { id: "C", text: "Reduce the number of distinct partition key values in the table." },
      { id: "D", text: "Avoid composite primary keys that combine a partition key and a sort key." }
    ],
    correct: ["A"],
    explanation:
      "Provisioned throughput is divided across physical partitions, and partitions are determined by the partition key. The more distinct key values a workload touches, the more evenly requests spread — which is why a high-cardinality partition key is the fix for a hot partition.",
    whyWrong: {
      B: "Low cardinality concentrates requests on fewer partitions, which is the cause of the throttling rather than the cure.",
      C: "Fewer distinct values makes concentration worse.",
      D: "A composite key gives more distinct partitions to work with and is generally helpful, not something to avoid."
    }
  },

  {
    id: "perf-047",
    domain: "Design High-Performing Architectures",
    topic: "Shared file storage selection",
    difficulty: "hard",
    type: "single",
    question:
      "A Linux rendering engine writes to an NFS share while a Windows editing application reads the same data over SMB. Today the company synchronises two file systems, doubling storage. Which AWS service removes the duplication with the fewest changes?",
    options: [
      { id: "A", text: "Amazon FSx for NetApp ONTAP, which serves the same data over NFS, SMB and iSCSI." },
      { id: "B", text: "Amazon EFS for the Linux side and FSx for Windows File Server for the Windows side." },
      { id: "C", text: "Amazon FSx for Lustre linked to an S3 bucket." },
      { id: "D", text: "An Amazon S3 bucket accessed by both applications through the SDK." }
    ],
    correct: ["A"],
    explanation:
      "FSx for NetApp ONTAP is multi-protocol: the same volume can be presented over NFS to Linux clients and SMB to Windows clients. One copy of the data serves both applications, and neither has to change protocol.",
    whyWrong: {
      B: "This is the existing arrangement in AWS form — two file systems and the same synchronisation and duplication problem.",
      C: "FSx for Lustre is a Linux HPC file system and does not serve SMB to Windows clients.",
      D: "S3 is object storage with no file semantics; both applications would need rewriting."
    }
  },

  {
    id: "perf-048",
    domain: "Design High-Performing Architectures",
    topic: "Serverless compute with Lambda",
    difficulty: "medium",
    type: "single",
    question:
      "A REST API on API Gateway and Lambda expects a sudden surge of traffic after a product announcement. What protects the backend from request spikes?",
    options: [
      { id: "A", text: "Configure throttling limits and caching on the API Gateway stage." },
      { id: "B", text: "Nothing — API Gateway scales automatically and needs no configuration." },
      { id: "C", text: "Put CloudFront in front of API Gateway to act as the backend cache." },
      { id: "D", text: "Move the Lambda function into a VPC." }
    ],
    correct: ["A"],
    explanation:
      "API Gateway supports rate and burst throttling per stage and per method, returning 429 above the limit, and stage caching serves repeated requests without invoking the backend. Together they shield the backend from spikes.",
    whyWrong: {
      B: "API Gateway does scale, but without limits the traffic passes straight through to the backend, which is what needs protecting.",
      C: "API Gateway already runs at edge locations for edge-optimised endpoints, and CloudFront does not throttle per-method request rates.",
      D: "Putting a function in a VPC affects its network path, not its exposure to traffic volume."
    }
  },

  {
    id: "perf-049",
    domain: "Design High-Performing Architectures",
    topic: "Data transfer and migration services",
    difficulty: "medium",
    type: "multi",
    question:
      "A .NET application on Windows Server with an Oracle Standard Edition backend must move to AWS with minimal development change and improved availability. Which TWO actions fit?",
    options: [
      { id: "A", text: "Rehost the .NET application on AWS Elastic Beanstalk in a Multi-AZ environment." },
      { id: "B", text: "Migrate the Oracle database to Amazon RDS for Oracle in a Multi-AZ deployment using AWS DMS." },
      { id: "C", text: "Refactor the application to .NET Core and run it on Amazon EKS with Fargate." },
      { id: "D", text: "Replatform onto ECS with EC2 worker nodes using a Windows AMI and ECS Anywhere." },
      { id: "E", text: "Convert the schema with AWS Schema Conversion Tool before migrating." }
    ],
    correct: ["A", "B"],
    explanation:
      "Elastic Beanstalk supports ASP.NET on IIS and provisions a Multi-AZ environment without code changes, which is the definition of a rehost. Moving Oracle to RDS for Oracle is a homogeneous migration that DMS handles directly, and Multi-AZ supplies the availability.",
    whyWrong: {
      C: "Refactoring to .NET Core is a significant code change, which the requirement explicitly excludes.",
      D: "Replatforming onto ECS with EC2 workers means managing the instances and reworking deployment — more change and more operations.",
      E: "SCT is for heterogeneous migrations. Oracle to Oracle needs no schema conversion."
    }
  },

  {
    id: "perf-050",
    domain: "Design High-Performing Architectures",
    topic: "Analytics with Athena and Redshift",
    difficulty: "medium",
    type: "single",
    question:
      "Raw 2 GB CSV files arrive hourly in S3 and must be converted to Apache Parquet in another bucket, with the conversion starting as soon as each file lands. Which design has the least operational overhead?",
    options: [
      { id: "A", text: "An AWS Glue ETL job that writes Parquet output, triggered by an EventBridge rule on S3 Object Created events." },
      { id: "B", text: "A Glue crawler scheduled hourly to find new files and convert them." },
      { id: "C", text: "A Lambda function triggered by S3 events, with AWS Transfer Family moving the output." },
      { id: "D", text: "An Apache Spark job on EC2, invoked through a Lambda Function URL on each upload." }
    ],
    correct: ["A"],
    explanation:
      "Glue handles the conversion to Parquet natively and is serverless, and an EventBridge rule on Object Created starts the job the moment a file arrives. Nothing is provisioned and no polling or scheduling logic is written.",
    whyWrong: {
      B: "A crawler catalogues data on a schedule; it neither converts formats nor reacts to an upload immediately.",
      C: "A 2 GB conversion risks Lambda's memory and 15-minute limits, and Transfer Family is an SFTP service with no role in moving output between buckets.",
      D: "Running Spark on EC2 means provisioning, patching and scaling a cluster — the opposite of least overhead."
    }
  },

  {
    id: "cost-037",
    domain: "Design Cost-Optimized Architectures",
    topic: "Elastic scaling to match demand",
    difficulty: "medium",
    type: "single",
    question:
      "An Auto Scaling group is over-provisioned, and the manager wants capacity reduced without hurting performance. Which dynamic scaling policy keeps a chosen metric near a target and adjusts continuously?",
    options: [
      { id: "A", text: "Target tracking scaling." },
      { id: "B", text: "Simple scaling." },
      { id: "C", text: "Scheduled scaling." },
      { id: "D", text: "Suspend and resume scaling processes." }
    ],
    correct: ["A"],
    explanation:
      "Target tracking keeps a metric such as average CPU close to a value you choose, adding and removing capacity as load moves. That is what removes over-provisioning without the thresholds and cooldown delays of the older policy types.",
    whyWrong: {
      B: "Simple scaling must wait out a cooldown after each activity before responding again, so it reacts more slowly and less precisely.",
      C: "Scheduled scaling suits predictable calendar patterns, not continuous right-sizing against actual load.",
      D: "Suspending scaling processes pauses automation entirely, which is the opposite of the goal."
    }
  },

  {
    id: "cost-038",
    domain: "Design Cost-Optimized Architectures",
    topic: "Database cost optimization",
    difficulty: "medium",
    type: "single",
    question:
      "Performance testing runs against a large MySQL RDS instance twice a week. Between tests the database is unused. What is the most cost-effective way to run the tests without compromising them?",
    options: [
      { id: "A", text: "Snapshot the database and delete the instance after each test, restoring from the snapshot when the next test is due." },
      { id: "B", text: "Stop the instance after each test and start it again when needed." },
      { id: "C", text: "Downgrade to a smaller instance class." },
      { id: "D", text: "Run the tests against a local copy taken with mysqldump." }
    ],
    correct: ["A"],
    explanation:
      "A stopped RDS instance still bills for its provisioned storage, and RDS restarts stopped instances automatically after seven days. Snapshotting and deleting leaves only the much cheaper snapshot storage between runs, and restoring reproduces the same instance for the next test.",
    whyWrong: {
      B: "Stopping removes the instance-hour charge but keeps paying for storage, and the seven-day automatic restart means it will not stay stopped between weekly tests anyway.",
      C: "A smaller instance changes the performance characteristics being measured, compromising the tests.",
      D: "A laptop does not reproduce RDS behaviour, so the results would not be trustworthy."
    }
  },

  {
    id: "cost-039",
    domain: "Design Cost-Optimized Architectures",
    topic: "Compute pricing models",
    difficulty: "medium",
    type: "multi",
    question:
      "An application on Reserved Instances has been decommissioned, and the company wants to stop paying for the reservations as quickly as possible. Which TWO actions should be taken?",
    options: [
      { id: "A", text: "List the Standard Reserved Instances for sale on the AWS Reserved Instance Marketplace." },
      { id: "B", text: "Terminate the running instances so they are not billed at On-Demand rates when the reservation expires." },
      { id: "C", text: "Stop the instances rather than terminating them." },
      { id: "D", text: "Contact AWS to cancel the account subscription." },
      { id: "E", text: "Sell the reservations on the Amazon.com retail site." }
    ],
    correct: ["A", "B"],
    explanation:
      "Standard Reserved Instances can be sold on the Reserved Instance Marketplace, which recovers value from the remaining term. The running instances should be terminated because once the reservation lapses they would bill at full On-Demand rates, and the workload is gone.",
    whyWrong: {
      C: "A stopped instance can be restarted and still carries charges for attached storage and any associated Elastic IP addresses.",
      D: "Closing the whole account is drastic and unnecessary for retiring one application.",
      E: "Reservations are sold through the AWS Reserved Instance Marketplace, not the retail site."
    }
  },

  {
    id: "cost-040",
    domain: "Design Cost-Optimized Architectures",
    topic: "S3 storage class selection",
    difficulty: "hard",
    type: "single",
    question:
      "Easily reproducible files are read frequently for one month. After that, most are rarely read with no retrieval-time requirement, except those under a specific prefix which must still return in milliseconds. Which lifecycle design is cheapest?",
    options: [
      { id: "A", text: "After 30 days, move the objects under that prefix to S3 One Zone-IA and everything else to Glacier." },
      { id: "B", text: "After 30 days, move the objects under that prefix to S3 Standard-IA and everything else to Glacier." },
      { id: "C", text: "After 30 days, move the whole bucket to S3 Standard-IA." },
      { id: "D", text: "Move the whole bucket to S3 Intelligent-Tiering." }
    ],
    correct: ["A"],
    explanation:
      "Lifecycle rules can be scoped by prefix, so the millisecond-retrieval subset goes to an instant-access class while the rest goes to Glacier. Because the files are easily reproducible, One Zone-IA is acceptable and costs less than Standard-IA — losing an Availability Zone means regenerating rather than losing data.",
    whyWrong: {
      B: "Standard-IA works but costs more than One Zone-IA, and the reproducibility of the data is exactly what makes the cheaper class safe here.",
      C: "This leaves the rarely-read majority in an infrequent-access class when Glacier would be far cheaper.",
      D: "Intelligent-Tiering charges monitoring per object to discover an access pattern that is already known."
    }
  },

  {
    id: "cost-041",
    domain: "Design Cost-Optimized Architectures",
    topic: "Lifecycle policies and archival",
    difficulty: "medium",
    type: "single",
    question:
      "Audit logs must be retained for five years, and the compliance team requires that nobody — including administrators — can delete them before that. Which mechanism enforces this?",
    options: [
      { id: "A", text: "Store the logs in an S3 Glacier vault and apply a Vault Lock policy denying deletion until the retention period elapses." },
      { id: "B", text: "Store the logs in S3 with MFA Delete enabled on the bucket." },
      { id: "C", text: "Store the logs on an EBS volume and take monthly snapshots." },
      { id: "D", text: "Store the logs on EFS and rely on NFSv4 file locking." }
    ],
    correct: ["A"],
    explanation:
      "A Vault Lock policy becomes immutable once locked — it cannot be changed or removed even by the account owner, so a deny on deletion until the retention period elapses is genuinely enforceable against everyone.",
    whyWrong: {
      B: "MFA Delete adds a factor but anyone holding the MFA device can still delete, so it is not an absolute control.",
      C: "Anyone with EBS permissions can delete the volume and its snapshots.",
      D: "NFS file locking coordinates concurrent access; it is not a retention control and can be overridden."
    }
  },

  {
    id: "cost-042",
    domain: "Design Cost-Optimized Architectures",
    topic: "Environment scheduling and idle resources",
    difficulty: "medium",
    type: "single",
    question:
      "A Windows application with an attached FSx file system is stopped overnight to save money, but takes several minutes to become usable after each restart. How can start-up time be cut without raising cost materially?",
    options: [
      { id: "A", text: "Move the workload to an instance launched with hibernation enabled, so memory state is preserved between stops." },
      { id: "B", text: "Enable hibernation on the existing running instance." },
      { id: "C", text: "Migrate the application to a Linux instance." },
      { id: "D", text: "Disable the Instance Metadata Service to shorten boot." }
    ],
    correct: ["A"],
    explanation:
      "Hibernation writes the instance's memory contents to the root volume on stop and restores them on start, so applications resume where they left off instead of initialising from scratch. While hibernated you pay only for storage and any Elastic IP, so the overnight saving is preserved.",
    whyWrong: {
      B: "Hibernation must be enabled at launch; it cannot be turned on for an instance that already exists.",
      C: "Changing operating system is a large, risky change with no guarantee of faster start-up.",
      D: "The Instance Metadata Service is a network endpoint, not a boot-time task, so disabling it saves nothing."
    }
  },

/* ---- batch 1 to the measured exam spec ----
 * Targets from 324 questions of exam-style material: stems ~70 words with
 * competing constraints, distractors at comparable length to the answer,
 * ~30% carrying a MOST/LEAST qualifier, ~17% multi-answer.
 * Concepts chosen to close measured coverage gaps. */

  {
    id: "sec-059",
    domain: "Design Secure Architectures",
    topic: "Identity federation and IAM Identity Center",
    difficulty: "medium",
    type: "single",
    question:
      "A manufacturing company runs an on-premises Active Directory forest that its security team requires to remain the single authoritative source of user accounts. The company is deploying a fleet of Windows EC2 instances in a VPC connected to the corporate network by AWS Direct Connect, and employees must sign in to those instances with their existing corporate credentials. The security team will not permit directory objects to be replicated into AWS. Which solution meets these requirements with the LEAST operational overhead?",
    options: [
      { id: "A", text: "Deploy AWS Directory Service AD Connector in the VPC and seamlessly domain-join the Windows instances through it." },
      { id: "B", text: "Deploy AWS Managed Microsoft AD in the VPC, establish a two-way forest trust with the on-premises Active Directory, and domain-join the Windows instances to the AWS-hosted directory so that corporate accounts stay usable if the Direct Connect link goes down." },
      { id: "C", text: "Deploy Simple AD in the VPC, create matching user accounts for every employee who needs access, and domain-join the Windows instances to the Simple AD directory." },
      { id: "D", text: "Configure IAM Identity Center with the on-premises Active Directory as an external identity provider and have employees authenticate to the Windows instances through the AWS access portal." }
    ],
    correct: ["A"],
    explanation:
      "AD Connector is a directory proxy. It forwards authentication and user-lookup requests to on-premises domain controllers over the existing connection and stores no directory objects in AWS, which satisfies the security team's constraint directly. It supports seamless domain join for Windows EC2 instances, so no per-instance configuration is required.",
    whyWrong: {
      B: "A managed directory in AWS holds its own directory objects and a forest trust keeps them synchronised, which is exactly what the security team prohibited, and it costs more to run than a proxy.",
      C: "Simple AD is a standalone Samba-based directory that cannot trust or proxy to an existing forest, so accounts would have to be duplicated and maintained separately from the authoritative source.",
      D: "IAM Identity Center federates access to AWS accounts and SAML applications. It does not provide the Windows domain authentication a server needs for interactive operating-system sign-in."
    }
  },

  {
    id: "sec-060",
    domain: "Design Secure Architectures",
    topic: "Identity federation and IAM Identity Center",
    difficulty: "hard",
    type: "single",
    question:
      "A healthcare provider is migrating a .NET application to EC2 instances running Windows Server. The application requires LDAP lookups and Group Policy objects to configure its hosts, and it stores data in an Amazon RDS for SQL Server database that must authenticate application users with Windows Authentication. The provider's on-premises Active Directory must remain authoritative for identities, and the operations team is small. Which solution meets these requirements?",
    options: [
      { id: "A", text: "Deploy AWS Managed Microsoft AD and configure a one-way forest trust so the AWS directory trusts the on-premises forest, then join the EC2 instances and the RDS for SQL Server instance to the AWS directory." },
      { id: "B", text: "Deploy AWS Directory Service AD Connector so that authentication is proxied to the on-premises domain controllers, then join the EC2 instances and the RDS for SQL Server instance to the directory through the connector." },
      { id: "C", text: "Deploy Simple AD sized for the user population, apply the required Group Policy objects to it, and enable Windows Authentication on the RDS for SQL Server instance against that directory." },
      { id: "D", text: "Run self-managed Active Directory domain controllers on EC2 instances in the VPC, replicate the on-premises forest to them, and point both the application hosts and the database at those controllers." }
    ],
    correct: ["A"],
    explanation:
      "Amazon RDS for SQL Server supports Windows Authentication only through AWS Managed Microsoft AD, not through AD Connector or Simple AD. A one-way trust in which the AWS directory trusts the on-premises forest lets corporate users authenticate while leaving the on-premises forest authoritative, and Managed Microsoft AD is a real Microsoft AD so LDAP and Group Policy behave normally.",
    whyWrong: {
      B: "AD Connector cannot be used to enable Windows Authentication on RDS for SQL Server, and it does not host Group Policy objects of its own, so two of the stated requirements fail.",
      C: "Simple AD is Samba-based rather than genuine Active Directory. It supports neither forest trusts nor RDS for SQL Server Windows Authentication, and its Group Policy support is limited.",
      D: "Self-managed domain controllers can satisfy the technical requirements but leave the small operations team patching, monitoring and backing up the controllers themselves."
    }
  },

  {
    id: "sec-061",
    domain: "Design Secure Architectures",
    topic: "Certificate management and encryption in transit",
    difficulty: "medium",
    type: "single",
    question:
      "A retailer serves its storefront from an Amazon CloudFront distribution with an Application Load Balancer origin in the eu-west-1 Region. An engineer requested a public certificate for the storefront's custom domain in AWS Certificate Manager in eu-west-1 and validated it successfully, but the certificate does not appear in the list of certificates available to the CloudFront distribution. The team needs the custom domain served over HTTPS. What should the engineer do?",
    options: [
      { id: "A", text: "Request or import a public ACM certificate for the domain in the us-east-1 Region and select it in the distribution settings." },
      { id: "B", text: "Attach the existing eu-west-1 certificate to the Application Load Balancer and configure the CloudFront distribution to use the default CloudFront certificate for viewer connections, so that visitors reach the site through the distribution's own domain name rather than the storefront domain." },
      { id: "C", text: "Issue a certificate for the domain from an AWS Private Certificate Authority in eu-west-1 and associate that certificate with the CloudFront distribution." },
      { id: "D", text: "Enable automatic certificate rotation on the eu-west-1 certificate so that ACM replicates the validated certificate into the Regions used by CloudFront edge locations." }
    ],
    correct: ["A"],
    explanation:
      "CloudFront reads viewer certificates only from ACM in us-east-1, regardless of where the origin runs. Requesting the certificate in that Region makes it selectable. The eu-west-1 certificate remains useful for the ALB itself, since a load balancer requires a certificate in its own Region.",
    whyWrong: {
      B: "The default CloudFront certificate covers only the cloudfront.net domain name, so the retailer's own domain would produce certificate warnings for viewers.",
      C: "A private CA issues certificates that public browsers do not trust, so storefront visitors would see errors. Private CA suits internal traffic, not a public site.",
      D: "ACM does not replicate certificates between Regions, and rotation concerns renewal rather than Regional availability."
    }
  },

  {
    id: "sec-062",
    domain: "Design Secure Architectures",
    topic: "VPC connectivity: peering, Transit Gateway and VPN",
    difficulty: "medium",
    type: "single",
    question:
      "A financial services firm connects its data centre to AWS with a single 10 Gbps Direct Connect dedicated connection terminating at one Direct Connect location. An architecture review flags that a failure of that Direct Connect location would sever all connectivity to the VPC. The firm wants connectivity to survive such a failure, accepts reduced bandwidth while running on the backup path, and wants to limit additional monthly cost. Which approach is MOST cost-effective?",
    options: [
      { id: "A", text: "Configure an AWS Site-to-Site VPN over the internet as a backup path to the same virtual private gateway, with BGP shifting traffic on failure." },
      { id: "B", text: "Order a second 10 Gbps dedicated connection at a different Direct Connect location and run both connections in an active-active configuration using BGP for path selection." },
      { id: "C", text: "Order a second 10 Gbps dedicated connection at the same Direct Connect location, terminate it on a separate customer router, and advertise the same prefixes over both connections so that either router can carry the full production load on its own." },
      { id: "D", text: "Attach the virtual private gateway to an AWS Transit Gateway and associate the existing Direct Connect connection with a transit virtual interface for automatic redundancy." }
    ],
    correct: ["A"],
    explanation:
      "A Site-to-Site VPN over the public internet is billed at a low hourly rate plus data transfer and provides an independent path that does not share the failed Direct Connect location. BGP withdraws the Direct Connect routes on failure and traffic moves to the VPN, at lower bandwidth but with continuity, which is what the firm asked for.",
    whyWrong: {
      B: "A second dedicated connection at a different location does give the strongest resilience, but a second 10 Gbps port plus cross-connect and provider circuit is far more expensive than a VPN backup.",
      C: "A second connection at the same Direct Connect location protects against a device or port failure but not against loss of that location, which is the risk the review identified.",
      D: "Transit Gateway changes how networks are attached and routed. It adds no additional physical path, so a Direct Connect location failure still removes all connectivity."
    }
  },

  {
    id: "res-053",
    domain: "Design Resilient Architectures",
    topic: "Disaster recovery strategies",
    difficulty: "medium",
    type: "single",
    question:
      "A media company runs about 120 virtual machines on VMware in its own data centre. Management wants an AWS-based disaster recovery capability with a recovery point objective measured in minutes and a recovery time objective under one hour. The finance team refuses to fund a permanently running duplicate of the production fleet, and the operations team does not want to rewrite the applications. Which solution meets these requirements MOST cost-effectively?",
    options: [
      { id: "A", text: "Use AWS Elastic Disaster Recovery to replicate the source machines continuously into a low-cost staging area, launching full recovery instances only at failover." },
      { id: "B", text: "Use AWS Backup with a scheduled daily backup plan that copies recovery points to the target Region, and restore the machines into EC2 when a disaster is declared." },
      { id: "C", text: "Build a warm standby environment in the target Region with scaled-down but permanently running copies of every virtual machine, keep them patched in step with production, and scale them up when a disaster is declared." },
      { id: "D", text: "Use AWS Database Migration Service with ongoing change data capture to replicate the workloads into the target Region and promote the replicas during a failover." }
    ],
    correct: ["A"],
    explanation:
      "Elastic Disaster Recovery replicates block-level changes continuously into an inexpensive staging area that uses low-cost storage and small replication servers rather than full production instances. That yields an RPO of minutes, allows conversion and launch within the RTO, and needs no application changes.",
    whyWrong: {
      B: "Daily backups give a recovery point up to twenty-four hours old, which misses an RPO measured in minutes, and restoring 120 machines is unlikely to complete within an hour.",
      C: "Warm standby can meet both objectives but requires running duplicate infrastructure continuously, which is the cost the finance team rejected.",
      D: "Database Migration Service replicates databases, not whole virtual machines, so the application and operating system layers would be left unprotected."
    }
  },

  {
    id: "res-054",
    domain: "Design Resilient Architectures",
    topic: "Backup and restore with AWS Backup",
    difficulty: "medium",
    type: "single",
    question:
      "A research institute keeps 40 TB of instrument output on an on-premises NFS share. Scientists must continue to read and write the newest files from the existing share with low latency, while all data is durably stored in Amazon S3 so that a future analytics pipeline can read the files directly as S3 objects. The institute wants to avoid rewriting the instrument software. Which solution meets these requirements?",
    options: [
      { id: "A", text: "Deploy an Amazon S3 File Gateway on premises, expose it to the instruments as an NFS mount, and let it store each file as a native object in an S3 bucket." },
      { id: "B", text: "Deploy a Volume Gateway in cached mode, present iSCSI volumes to the instrument hosts, and take EBS snapshots of those volumes into the S3 bucket on a schedule." },
      { id: "C", text: "Deploy a Tape Gateway, point the existing backup application at the virtual tape library, and store the resulting virtual tapes in the S3 bucket so that the institute keeps the retention schedules it already operates." },
      { id: "D", text: "Run a scheduled AWS DataSync task that copies the NFS share to the S3 bucket every night and have the analytics pipeline read the copied objects." }
    ],
    correct: ["A"],
    explanation:
      "S3 File Gateway presents an NFS or SMB mount and writes each file through to S3 as a discrete object, keeping a local cache for low-latency access to recent data. Because the files land as native objects, the future analytics pipeline can read them directly without an intermediate extraction step.",
    whyWrong: {
      B: "Volume Gateway stores data as EBS snapshots rather than individual objects, so an analytics pipeline cannot read the files from S3 without restoring a volume first.",
      C: "Tape Gateway writes virtual tape images intended for backup software. The contents are not addressable as individual objects for analytics.",
      D: "A nightly DataSync copy duplicates the data rather than providing the low-latency working share, and files written after the last run would be missing."
    }
  },

  {
    id: "res-055",
    domain: "Design Resilient Architectures",
    topic: "Load balancer selection",
    difficulty: "medium",
    type: "single",
    question:
      "A gaming company is launching a multiplayer backend that communicates with clients over UDP. At peak the service is expected to hold several million concurrent connections, and partner studios need a small set of fixed IP addresses to place in their own firewall allow-lists. The backend runs on EC2 instances in an Auto Scaling group across three Availability Zones. Which load balancing solution should the architect choose?",
    options: [
      { id: "A", text: "A Network Load Balancer with a UDP listener, which provides one static IP address per Availability Zone and can optionally take Elastic IP addresses for the allow-list requirement." },
      { id: "B", text: "An Application Load Balancer with a listener rule that forwards traffic to the Auto Scaling group, fronted by Elastic IP addresses assigned to each of its nodes." },
      { id: "C", text: "A Gateway Load Balancer that distributes the UDP flows to the instances while preserving the original source and destination addresses." },
      { id: "D", text: "A Classic Load Balancer configured with a TCP listener and cross-zone load balancing enabled across the three Availability Zones." }
    ],
    correct: ["A"],
    explanation:
      "Network Load Balancer operates at layer 4, supports UDP listeners, scales to millions of connections and exposes one static IP per Availability Zone, with the option to assign Elastic IPs. That matches every stated requirement.",
    whyWrong: {
      B: "Application Load Balancer works only with HTTP and HTTPS, so it cannot carry UDP, and its addresses are not static.",
      C: "Gateway Load Balancer exists to insert third-party virtual appliances into the traffic path. It is not the entry point for an application's own clients.",
      D: "Classic Load Balancer supports TCP and SSL but not UDP, and it is a previous-generation option that AWS no longer recommends for new designs."
    }
  },

  {
    id: "perf-052",
    domain: "Design High-Performing Architectures",
    topic: "Data transfer and migration services",
    difficulty: "medium",
    type: "multi",
    question:
      "A broadcaster must move a 500 TB video archive from its data centre into Amazon S3. The site has a 1 Gbps internet connection that is also carrying production traffic, and the migration must finish within a few weeks. After the bulk archive has landed, roughly 2 TB of newly produced footage per day must continue to flow into the same bucket. Which TWO actions together meet these requirements? (Select TWO.)",
    options: [
      { id: "A", text: "Order AWS Snowball Edge devices, copy the archive onto them locally, and ship them to AWS for import." },
      { id: "B", text: "Deploy AWS DataSync with an on-premises agent and schedule daily tasks for the new footage." },
      { id: "C", text: "Copy the entire 500 TB archive over the existing internet connection using multipart uploads from a script running on several on-premises hosts in parallel, throttled so that production traffic keeps priority during business hours." },
      { id: "D", text: "Provision an AWS Direct Connect dedicated connection and transfer both the archive and the daily footage across it once the circuit has been installed." },
      { id: "E", text: "Enable S3 Transfer Acceleration on the destination bucket and upload the archive through the accelerated endpoint from the existing internet connection." }
    ],
    correct: ["A", "B"],
    explanation:
      "Physically shipping the bulk archive on Snowball Edge devices removes the constraint of a shared 1 Gbps link, and DataSync then handles the recurring daily transfer with scheduling, integrity checking and retries built in. Together they cover the one-off migration and the steady-state flow.",
    whyWrong: {
      C: "A 500 TB transfer over a shared 1 Gbps link would take months even at full utilisation, and saturating the link would damage production traffic.",
      D: "A dedicated connection is useful long term, but provisioning typically takes weeks before any data moves, so the deadline is at risk.",
      E: "Transfer Acceleration improves throughput over long distances but is still bounded by the same 1 Gbps local circuit, so the bulk copy remains too slow."
    }
  },

  {
    id: "perf-053",
    domain: "Design High-Performing Architectures",
    topic: "Data transfer and migration services",
    difficulty: "hard",
    type: "single",
    question:
      "A logistics company is moving a 4 TB Oracle database that backs a warehouse system to Amazon Aurora PostgreSQL. The application can tolerate only a few minutes of downtime at cutover, and the schema makes heavy use of Oracle-specific stored procedures and data types that have no direct PostgreSQL equivalent. The team wants to validate the converted schema before any production data is moved. Which approach should the architect recommend?",
    options: [
      { id: "A", text: "Convert the schema with AWS Schema Conversion Tool, fix the objects its assessment report flags, then run a DMS task in full load plus change data capture mode." },
      { id: "B", text: "Run an AWS Database Migration Service full load task against the target Aurora cluster and allow DMS to create the target schema automatically as part of that task, then cut over when the load finishes." },
      { id: "C", text: "Export the Oracle database with Data Pump, copy the dump file to Amazon S3, and import it into the Aurora PostgreSQL cluster during an extended maintenance window." },
      { id: "D", text: "Create an Aurora PostgreSQL read replica of the Oracle database and promote it to a standalone cluster once replication has caught up at the cutover point." }
    ],
    correct: ["A"],
    explanation:
      "Schema Conversion Tool performs the heterogeneous conversion and produces an assessment report identifying objects that require manual work, which is exactly the pre-migration validation the team wants. DMS with full load and change data capture then keeps the target current while the source stays online, holding cutover downtime to minutes.",
    whyWrong: {
      B: "DMS creates only a basic target schema of tables and primary keys. Stored procedures, custom types and secondary indexes are not converted, so the application would not work.",
      C: "A Data Pump export and import is an offline operation whose duration scales with database size, breaching the few-minute downtime limit, and it does not translate Oracle-specific objects.",
      D: "Read replicas exist only within the same engine family. Aurora PostgreSQL cannot be made a replica of an Oracle database."
    }
  },

  {
    id: "perf-054",
    domain: "Design High-Performing Architectures",
    topic: "Shared file storage selection",
    difficulty: "medium",
    type: "single",
    question:
      "An engineering firm is migrating a Windows-based document management application to EC2 instances in two Availability Zones. The application requires an SMB file share, and access to individual folders must be controlled by Active Directory group membership using standard Windows ACLs. The share must remain available if one Availability Zone fails. Which storage solution should the architect select?",
    options: [
      { id: "A", text: "Amazon FSx for Windows File Server in a Multi-AZ deployment, joined to AWS Managed Microsoft AD." },
      { id: "B", text: "Amazon Elastic File System with mount targets in both Availability Zones and POSIX permissions mapped to the corporate group identifiers." },
      { id: "C", text: "An Amazon S3 File Gateway on an EC2 instance in each Availability Zone, exposing an SMB share backed by a shared S3 bucket." },
      { id: "D", text: "Amazon FSx for Lustre with a persistent deployment type linked to an S3 bucket holding the document repository." }
    ],
    correct: ["A"],
    explanation:
      "FSx for Windows File Server is a native Windows file system that speaks SMB and enforces NTFS ACLs against Active Directory identities. A Multi-AZ deployment maintains a standby file server in a second Availability Zone with automatic failover, meeting the availability requirement.",
    whyWrong: {
      B: "EFS presents NFS with POSIX permissions. A Windows application expecting SMB and NTFS ACLs cannot use it without substantial change.",
      C: "File Gateway offers SMB but is a caching appliance rather than a highly available file system, and running one per Availability Zone over the same bucket does not give consistent locking or failover.",
      D: "FSx for Lustre targets high-throughput compute workloads over POSIX clients. It does not provide SMB access or NTFS permissions."
    }
  },

  {
    id: "cost-043",
    domain: "Design Cost-Optimized Architectures",
    topic: "Data transfer and NAT cost",
    difficulty: "medium",
    type: "multi",
    question:
      "A analytics platform runs on EC2 instances in private subnets that reach Amazon S3 and Amazon DynamoDB through a NAT gateway. A cost review shows that NAT gateway data processing charges have become one of the three largest line items on the monthly bill, and almost all of the traffic is reads from an S3 bucket and queries against DynamoDB tables in the same Region. Which TWO changes reduce this cost MOST effectively? (Select TWO.)",
    options: [
      { id: "A", text: "Create a gateway VPC endpoint for Amazon S3 and add it to the private subnet route tables." },
      { id: "B", text: "Create a gateway VPC endpoint for Amazon DynamoDB and associate it with those same route tables." },
      { id: "C", text: "Replace the NAT gateway with a NAT instance on a smaller instance type, route all private subnet traffic through it, and add health checks so a failed instance is replaced automatically." },
      { id: "D", text: "Move the EC2 instances into public subnets and assign each one an Elastic IP address so that they reach the services directly." },
      { id: "E", text: "Enable S3 Transfer Acceleration on the bucket so that requests from the private subnets take a shorter network path." }
    ],
    correct: ["A", "B"],
    explanation:
      "Gateway endpoints for S3 and DynamoDB are free of charge and keep traffic to those services inside the AWS network, removing both the NAT gateway data processing charge and the associated data transfer for that traffic.",
    whyWrong: {
      C: "A NAT instance shifts cost to an instance you must patch, scale and make highly available, and it still processes the same traffic volume.",
      D: "Placing analytics instances in public subnets undermines the security posture that motivated private subnets, and data transfer charges still apply.",
      E: "Transfer Acceleration is intended for long-distance uploads over the internet and adds a per-gigabyte premium, so it would raise cost rather than lower it."
    }
  },

  {
    id: "cost-044",
    domain: "Design Cost-Optimized Architectures",
    topic: "Compute pricing models",
    difficulty: "medium",
    type: "single",
    question:
      "A software company runs a steady baseline of production workloads split across EC2 instances, AWS Fargate tasks and AWS Lambda functions. Over the next year the team expects to keep total compute spend roughly constant but to shift a growing share of it from EC2 to Fargate as services are containerised, and it may change instance families and Regions along the way. The company wants the largest discount it can commit to without constraining those changes. Which purchasing option should it choose?",
    options: [
      { id: "A", text: "Purchase a one-year Compute Savings Plan for the baseline hourly spend, which applies automatically across EC2, Fargate and Lambda regardless of instance family or Region." },
      { id: "B", text: "Purchase one-year EC2 Instance Savings Plans covering the current instance families in the current Regions, and buy additional plans as workloads move to Fargate." },
      { id: "C", text: "Purchase one-year Standard Reserved Instances for the current EC2 footprint and rely on On-Demand pricing for the Fargate and Lambda usage." },
      { id: "D", text: "Run the baseline workloads on Spot Instances with a capacity-optimized allocation strategy and keep On-Demand capacity in reserve for interruptions." }
    ],
    correct: ["A"],
    explanation:
      "Compute Savings Plans commit to an hourly spend rather than to specific resources and apply automatically across EC2, Fargate and Lambda, in any Region and any instance family. That preserves the flexibility to containerise and relocate workloads while still discounting the committed baseline.",
    whyWrong: {
      B: "EC2 Instance Savings Plans deliver a deeper discount but lock the commitment to an instance family in one Region, and they do not apply to Fargate or Lambda at all.",
      C: "Standard Reserved Instances are the least flexible option, cannot be applied to Fargate or Lambda, and would leave the growing container spend undiscounted.",
      D: "Spot capacity can be reclaimed at short notice, which is unsuitable for a steady production baseline, and Spot is a capacity choice rather than a commitment discount."
    }
  },

  {
    id: "sec-063",
    domain: "Design Secure Architectures",
    topic: "Application authentication with Cognito",
    difficulty: "medium",
    type: "single",
    question:
      "A retailer is launching a mobile application that lets shoppers sign in with an email address and password or with their existing Google account. After signing in, the application must upload photographs directly from the device to a prefix in an Amazon S3 bucket that is unique to each shopper. The development team does not want to embed long-lived credentials in the application or run authentication servers. Which combination should the architect use?",
    options: [
      { id: "A", text: "An Amazon Cognito user pool for sign-in and an identity pool that exchanges the pool token for temporary IAM credentials scoped to the user's prefix." },
      { id: "B", text: "An Amazon Cognito user pool for sign-in, with the application calling S3 using an IAM user access key that is distributed with the mobile client." },
      { id: "C", text: "An IAM Identity Center instance federated to Google, issuing each shopper a permission set that grants access to their own prefix in the bucket." },
      { id: "D", text: "An API Gateway REST API with an IAM authorizer in front of S3, where each shopper is created as an IAM user at first sign-in." }
    ],
    correct: ["A"],
    explanation:
      "A user pool handles sign-up, sign-in and the Google federation. The identity pool then trades the resulting token for temporary AWS credentials, and a role with a policy keyed on the substitution variable ${cognito-identity.amazonaws.com:sub} restricts each shopper to their own prefix. Nothing long-lived ships with the app.",
    whyWrong: {
      B: "Any credential shipped inside a mobile binary can be extracted, and a single access key cannot isolate one shopper's prefix from another's.",
      C: "IAM Identity Center manages workforce access to AWS accounts and internal applications. It is not designed to authenticate large numbers of external consumers.",
      D: "IAM users are a hard-limited, long-lived construct meant for internal principals; creating one per shopper does not scale and adds an account to manage for every customer."
    }
  },

  {
    id: "sec-064",
    domain: "Design Secure Architectures",
    topic: "Application authentication with Cognito",
    difficulty: "hard",
    type: "single",
    question:
      "A company exposes an internal reporting API through Amazon API Gateway. Employees already sign in to a corporate SAML identity provider, and the security team requires that the API validate a JSON Web Token on every request without the API's own code performing signature checks or maintaining a user directory. Group membership carried in the token must determine which endpoints a caller may reach. What should the architect configure?",
    options: [
      { id: "A", text: "An Amazon Cognito user pool federated to the SAML provider, attached to API Gateway as a Cognito authorizer with scopes mapped to the endpoints." },
      { id: "B", text: "A Lambda authorizer on API Gateway that retrieves the signing keys from the SAML provider and verifies each token before allowing the request through." },
      { id: "C", text: "An API Gateway resource policy that permits requests only from the corporate IP ranges, with the SAML assertion passed as a request header." },
      { id: "D", text: "AWS WAF in front of API Gateway with a rule group that inspects the Authorization header and blocks requests carrying an invalid token." }
    ],
    correct: ["A"],
    explanation:
      "A Cognito user pool can federate to a SAML provider and issue its own JWTs. Attaching it to API Gateway as a Cognito authorizer means the gateway validates the token signature, expiry and scopes before the request reaches any application code, and group claims can be mapped to scopes per method.",
    whyWrong: {
      B: "A Lambda authorizer works, but writing and maintaining signature verification is exactly the custom validation code the security team asked to avoid.",
      C: "Source IP is a network control, not authentication, and an unverified assertion in a header proves nothing about the caller.",
      D: "WAF filters on request patterns and rates. It cannot verify a token signature or evaluate group claims."
    }
  },

  {
    id: "sec-065",
    domain: "Design Secure Architectures",
    topic: "Organizations SCPs and guardrails",
    difficulty: "medium",
    type: "multi",
    question:
      "A company uses AWS Organizations with all features enabled. To satisfy a data residency obligation, the security team must guarantee that no principal in any member account can create resources outside eu-west-1 and eu-central-1, including principals holding the AdministratorAccess policy. The team is drafting a service control policy attached to the organization root. Which TWO statements about this approach are correct? (Select TWO.)",
    options: [
      { id: "A", text: "The SCP restricts principals in member accounts even when their identity-based policy grants the action, because an SCP sets the maximum available permissions." },
      { id: "B", text: "Principals in the management account are not affected by service control policies, so the management account needs a separate control." },
      { id: "C", text: "An SCP grants permissions on its own, so member account principals will be able to use any action the SCP allows without an identity-based policy." },
      { id: "D", text: "Global services such as IAM and Amazon CloudFront are unaffected by a Region condition, so the policy must exempt them or legitimate calls will fail." },
      { id: "E", text: "Service control policies apply only to roles, so IAM users in member accounts would bypass the residency restriction entirely." }
    ],
    correct: ["A", "B"],
    explanation:
      "An SCP is a permissions boundary for an account: it caps what identity-based policies can grant, so even an administrator is limited by it. The management account is the documented exception — SCPs never restrict its principals — so residency there must be enforced another way.",
    whyWrong: {
      C: "An SCP never grants permissions. A principal still needs an identity-based policy allowing the action; the SCP only defines the ceiling.",
      D: "The observation about global services is a genuine design concern, but the fix is a NotAction exemption within the same policy rather than a statement about how SCPs apply.",
      E: "SCPs apply to all IAM principals in a member account, users and roles alike, with the single exception of the account's root user in some cases."
    }
  },

  {
    id: "sec-066",
    domain: "Design Secure Architectures",
    topic: "Organizations SCPs and guardrails",
    difficulty: "medium",
    type: "single",
    question:
      "A platform team hands a development team its own AWS account and wants developers to create IAM roles freely for their applications, while guaranteeing that no role they create can ever be granted permissions beyond a defined set. Developers must not be able to remove or weaken that guarantee. The platform team wants the control to live inside the development account rather than depending on a change to the organization. Which mechanism should be used?",
    options: [
      { id: "A", text: "Require a permissions boundary on every role the developers create, enforced by a condition on their role-creation permission." },
      { id: "B", text: "Attach a service control policy to the organizational unit that lists every action the development team is permitted to use." },
      { id: "C", text: "Give the developers a managed policy containing the permitted actions and rely on code review to prevent them attaching anything broader." },
      { id: "D", text: "Enable AWS Config rules in the account that detect over-permissive roles and raise findings in AWS Security Hub for the platform team." }
    ],
    correct: ["A"],
    explanation:
      "A permissions boundary caps the effective permissions of a role regardless of the identity policy attached to it. Granting iam:CreateRole only under a condition requiring a specific boundary means developers can create roles freely but cannot create one that exceeds the ceiling, and cannot strip the boundary.",
    whyWrong: {
      B: "An SCP would work, but the requirement was explicitly for a control inside the account rather than an organization-level change.",
      C: "Code review is a process control. Nothing technically prevents a developer attaching a broader policy.",
      D: "Config detects a violation after it exists, which is monitoring rather than the guarantee the platform team asked for."
    }
  },

  {
    id: "sec-067",
    domain: "Design Secure Architectures",
    topic: "VPC connectivity: peering, Transit Gateway and VPN",
    difficulty: "medium",
    type: "single",
    question:
      "A consultancy has 200 staff working from home who need to reach private subnets in two VPCs in the same Region, using their corporate Active Directory credentials with multi-factor authentication. There is no data centre and no existing Direct Connect. Staff connect from laptops on domestic broadband, and usage is concentrated in working hours. Which solution meets these requirements MOST cost-effectively?",
    options: [
      { id: "A", text: "AWS Client VPN with a Client VPN endpoint associated to subnets in both VPCs, authenticating against the corporate directory through AWS Directory Service." },
      { id: "B", text: "An AWS Site-to-Site VPN from each employee's home router to a virtual private gateway in each of the two VPCs." },
      { id: "C", text: "A bastion host in a public subnet in each VPC, with staff connecting over SSH and RDP using key pairs issued by the consultancy." },
      { id: "D", text: "AWS Verified Access with an application group per VPC, published to staff through a public endpoint and evaluated against directory group membership." }
    ],
    correct: ["A"],
    explanation:
      "Client VPN is the managed remote-access VPN for individual users. It authenticates against Active Directory through AWS Directory Service, supports MFA, and bills per associated subnet hour plus per connected client hour, so concentrated working-hours usage keeps cost proportional.",
    whyWrong: {
      B: "Site-to-Site VPN connects networks, not roaming individuals; 200 tunnels from domestic routers would be unmanageable and far more expensive.",
      C: "Bastion hosts expose SSH and RDP to the internet, provide no directory-integrated MFA by default, and give access to instances rather than the private networks.",
      D: "Verified Access publishes individual applications over HTTPS. It does not give laptops network-level reach into private subnets."
    }
  },

  {
    id: "sec-068",
    domain: "Design Secure Architectures",
    topic: "VPC endpoints and private connectivity",
    difficulty: "medium",
    type: "single",
    question:
      "An operations team administers EC2 instances that sit in private subnets with no internet gateway and no NAT gateway, as required by a security standard that forbids inbound SSH from any source. The team still needs interactive shell access for troubleshooting, and every session must be logged for audit. Which approach satisfies these requirements?",
    options: [
      { id: "A", text: "Use AWS Systems Manager Session Manager with interface VPC endpoints for ssm, ssmmessages and ec2messages, and send session logs to Amazon S3 or CloudWatch Logs." },
      { id: "B", text: "Deploy a bastion host in a public subnet, restrict its security group to the office CIDR, and enable VPC Flow Logs to record the sessions." },
      { id: "C", text: "Attach an internet gateway route to the private subnets only for the SSH port, and record connections with AWS CloudTrail data events." },
      { id: "D", text: "Use EC2 Instance Connect Endpoint with a security group rule permitting SSH from the endpoint, and audit access through VPC Flow Logs." }
    ],
    correct: ["A"],
    explanation:
      "Session Manager reaches instances through the SSM Agent making outbound calls, so no inbound port is opened and no internet path is required once the three interface endpoints exist. Session activity can be streamed to S3 or CloudWatch Logs, which satisfies the audit requirement.",
    whyWrong: {
      B: "A bastion still requires an inbound SSH listener, which the standard forbids, and Flow Logs record connection metadata rather than session content.",
      C: "Selectively routing a port through an internet gateway still exposes SSH to the internet, and CloudTrail data events do not capture shell sessions.",
      D: "Instance Connect Endpoint avoids the public bastion but still relies on an inbound SSH rule, and Flow Logs again capture metadata only."
    }
  },

  {
    id: "res-056",
    domain: "Design Resilient Architectures",
    topic: "Event-driven patterns with EventBridge",
    difficulty: "medium",
    type: "single",
    question:
      "An insurance company processes claims through five sequential stages, each implemented as an AWS Lambda function. Some stages call a third-party service that intermittently times out and must be retried with exponential backoff, and one stage can take up to twenty minutes. Operations staff need to see exactly which stage a given claim reached when something fails. Which solution meets these requirements with the LEAST operational overhead?",
    options: [
      { id: "A", text: "Model the workflow as an AWS Step Functions state machine with Retry and Catch on the failing states." },
      { id: "B", text: "Chain the Lambda functions by having each one invoke the next asynchronously, implementing retry and backoff logic inside each function." },
      { id: "C", text: "Publish an EventBridge event at the end of each stage and subscribe the next Lambda function to it, using a dead-letter queue on each rule." },
      { id: "D", text: "Place an Amazon SQS queue between each pair of stages and rely on the queue's visibility timeout and redrive policy to retry failures." }
    ],
    correct: ["A"],
    explanation:
      "Step Functions is purpose-built for multi-stage workflows: retries with backoff and catch handlers are declarative, execution history shows precisely which state a given claim reached, and a Standard workflow runs for up to a year, so a twenty-minute stage is not a constraint.",
    whyWrong: {
      B: "Every function ends up carrying orchestration code, and there is no single place to see how far a claim progressed.",
      C: "EventBridge decouples the stages but provides no execution view of an individual claim, so tracing one through five rules means correlating logs by hand.",
      D: "Queues give retry and buffering but no workflow state, and a twenty-minute stage forces careful visibility-timeout tuning at every hop."
    }
  },

  {
    id: "res-057",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "medium",
    type: "single",
    question:
      "A manufacturer is migrating a plant monitoring system to AWS. The existing application uses Apache ActiveMQ and depends on JMS features including message selectors and durable topic subscriptions. The company wants to move with as few application changes as possible and does not want to operate broker infrastructure. Which service should the architect choose?",
    options: [
      { id: "A", text: "Amazon MQ running ActiveMQ, which the existing JMS client can connect to unchanged." },
      { id: "B", text: "Amazon SQS FIFO queues, with the application's JMS calls rewritten to use the SQS API and message group identifiers." },
      { id: "C", text: "Amazon SNS topics with SQS subscriptions, reproducing durable topic behaviour through queue subscriptions per consumer." },
      { id: "D", text: "Amazon Managed Streaming for Apache Kafka, with the JMS producers and consumers ported to the Kafka client libraries." }
    ],
    correct: ["A"],
    explanation:
      "Amazon MQ is a managed broker that runs ActiveMQ or RabbitMQ and supports the standard protocols, including JMS with selectors and durable subscriptions. Migrating usually means repointing the connection string, which is the smallest possible change, with AWS operating the broker.",
    whyWrong: {
      B: "SQS has no JMS semantics: message selectors and durable topic subscriptions do not exist, so the messaging layer would have to be rewritten.",
      C: "SNS with SQS fan-out can approximate topics, but it is a different programming model and still requires rewriting the application.",
      D: "Kafka is a log-based streaming platform with its own client API and no JMS compatibility, making this the largest rewrite of the four."
    }
  },

  {
    id: "res-058",
    domain: "Design Resilient Architectures",
    topic: "Decoupling with SQS",
    difficulty: "medium",
    type: "multi",
    question:
      "An order service reads from an Amazon SQS standard queue and occasionally receives a malformed message that causes the consumer to throw an exception. The message becomes visible again after the visibility timeout and is reprocessed indefinitely, blocking throughput and filling the logs. The team wants poison messages set aside for inspection without losing them. Which TWO actions address this? (Select TWO.)",
    options: [
      { id: "A", text: "Configure a redrive policy on the source queue with a maxReceiveCount that sends repeat failures to a dead-letter queue." },
      { id: "B", text: "Create a separate SQS queue to serve as the dead-letter queue and set an appropriate retention period on it for later inspection." },
      { id: "C", text: "Reduce the visibility timeout on the source queue so failing messages return to the queue sooner and drain more quickly." },
      { id: "D", text: "Switch the source queue to FIFO so that a failing message blocks its message group and stops interfering with other orders." },
      { id: "E", text: "Enable server-side encryption on the queue so that malformed payloads are rejected by SQS before a consumer receives them." }
    ],
    correct: ["A", "B"],
    explanation:
      "A dead-letter queue plus a redrive policy is the standard poison-message pattern: SQS tracks the receive count and, once it exceeds maxReceiveCount, moves the message to the DLQ where it is retained for investigation instead of cycling forever.",
    whyWrong: {
      C: "A shorter visibility timeout makes the message reappear faster, which increases the reprocessing rate rather than stopping it.",
      D: "FIFO would make matters worse: a poison message blocks its entire message group until it is removed or expires.",
      E: "Encryption protects data at rest and has no bearing on whether a payload is well formed."
    }
  },

  {
    id: "res-059",
    domain: "Design Resilient Architectures",
    topic: "Route 53 routing policies",
    difficulty: "medium",
    type: "single",
    question:
      "A payments company runs an active deployment behind an Application Load Balancer in eu-west-1 and a passive, permanently running copy behind an ALB in us-east-1. All traffic should reach eu-west-1 while it is healthy, and move to us-east-1 automatically within a few minutes if the primary becomes unavailable. Traffic must return to eu-west-1 once it recovers. Which Route 53 configuration meets this requirement?",
    options: [
      { id: "A", text: "Failover routing with eu-west-1 as primary and us-east-1 as secondary, each with a health check." },
      { id: "B", text: "Latency-based routing with a record for each Region, so that clients are always sent to whichever endpoint currently responds fastest." },
      { id: "C", text: "Weighted routing with the eu-west-1 record at weight 100 and the us-east-1 record at weight 0, adjusted manually during an incident." },
      { id: "D", text: "Multivalue answer routing returning both ALB addresses, with health checks so unhealthy endpoints are omitted from the response." }
    ],
    correct: ["A"],
    explanation:
      "Failover routing expresses exactly this active-passive intent. Route 53 returns the primary while its health check passes and switches to the secondary when it fails, reverting automatically on recovery. Health check interval and threshold determine how quickly that happens.",
    whyWrong: {
      B: "Latency routing optimises for proximity, so European clients could be sent to us-east-1 whenever it happens to be faster, which is not active-passive.",
      C: "A weight of zero does suppress traffic, but changing weights during an incident is a manual step and the requirement was automatic failover.",
      D: "Multivalue answer returns several healthy records for client-side selection. It spreads traffic rather than preferring one Region."
    }
  },

  {
    id: "res-060",
    domain: "Design Resilient Architectures",
    topic: "Multi-AZ vs multi-Region design",
    difficulty: "hard",
    type: "single",
    question:
      "A gaming company serves players in Europe and North America from a single Region. Player profile data lives in an Amazon DynamoDB table, and the company wants players on both continents to read and write their profiles with single-digit millisecond latency. The design must also keep the service available if one Region becomes unreachable. Which approach meets these requirements?",
    options: [
      { id: "A", text: "Convert the table to a DynamoDB global table with a replica in each of the two Regions." },
      { id: "B", text: "Keep the single table and add DynamoDB Accelerator clusters in both Regions so that reads and writes are served from the local cache." },
      { id: "C", text: "Keep the single table and create cross-Region read replicas of it, promoting a replica if the primary Region becomes unreachable." },
      { id: "D", text: "Enable point-in-time recovery on the table and restore it into the second Region whenever a Regional failure is detected." }
    ],
    correct: ["A"],
    explanation:
      "Global tables give a multi-active replica in each selected Region with last-writer-wins conflict resolution, so players read and write locally at low latency, and the surviving replica continues serving if a Region is lost.",
    whyWrong: {
      B: "DAX accelerates reads only and must sit in the same Region as the table, so remote writes still cross the ocean and a Regional failure still takes the table out.",
      C: "DynamoDB has no cross-Region read replica construct; replication between Regions is what global tables provide.",
      D: "Point-in-time recovery is a backup mechanism. Restoring a table takes far longer than a failover and loses recent writes."
    }
  },

  {
    id: "res-061",
    domain: "Design Resilient Architectures",
    topic: "Auto Scaling and health checks",
    difficulty: "medium",
    type: "single",
    question:
      "An Auto Scaling group sits behind an Application Load Balancer. A memory leak causes the application process on some instances to stop answering HTTP requests while the operating system continues running normally. The load balancer stops sending those instances traffic, but the Auto Scaling group leaves them in service and capacity quietly degrades. What should the architect change?",
    options: [
      { id: "A", text: "Set the Auto Scaling group's health check type to ELB rather than EC2." },
      { id: "B", text: "Shorten the load balancer's health check interval and lower its unhealthy threshold so failures are detected sooner." },
      { id: "C", text: "Add a target tracking scaling policy on average CPU utilisation so the group launches replacements when throughput drops." },
      { id: "D", text: "Enable instance scale-in protection on the group so that healthy instances are never terminated during a scaling event." }
    ],
    correct: ["A"],
    explanation:
      "By default an Auto Scaling group uses EC2 status checks, which pass as long as the instance and its hypervisor are healthy. Switching the health check type to ELB makes the group act on the load balancer's application-level result and replace instances failing it.",
    whyWrong: {
      B: "Faster detection changes only how quickly the load balancer stops routing; the Auto Scaling group still never replaces the instance.",
      C: "A CPU-based policy may add capacity but leaves the broken instances in the group consuming cost and skewing metrics.",
      D: "Scale-in protection prevents termination, which is the opposite of what is needed here."
    }
  },

  {
    id: "perf-055",
    domain: "Design High-Performing Architectures",
    topic: "Containers on ECS, EKS and Fargate",
    difficulty: "medium",
    type: "single",
    question:
      "A team is containerising a stateless web API that receives unpredictable, spiky traffic. They want to run it on Amazon ECS without managing, patching or scaling any EC2 capacity, and they want to pay only for the resources each task consumes while it runs. The application has no requirement for GPUs, custom kernel parameters or persistent instance storage. Which launch configuration meets these requirements with the LEAST operational overhead?",
    options: [
      { id: "A", text: "Run the service on ECS with the Fargate launch type, sizing CPU and memory per task definition." },
      { id: "B", text: "Run the service on ECS with the EC2 launch type, backed by an Auto Scaling group using a cluster capacity provider." },
      { id: "C", text: "Run the service on Amazon EKS with self-managed node groups and the Kubernetes Cluster Autoscaler." },
      { id: "D", text: "Run the service on EC2 instances with Docker installed and an Application Load Balancer distributing across them." }
    ],
    correct: ["A"],
    explanation:
      "Fargate removes the instance layer entirely: AWS provisions the compute for each task, billing is per vCPU and gigabyte-second for the task's lifetime, and there is no host to patch or scale. The workload has none of the characteristics that would force EC2.",
    whyWrong: {
      B: "Capacity providers automate scaling but the EC2 instances remain the team's to patch, right-size and secure.",
      C: "EKS with self-managed nodes adds both the Kubernetes control plane concepts and node maintenance, which is more overhead rather than less.",
      D: "Running Docker on plain EC2 gives no orchestration, so placement, health and scaling all become the team's responsibility."
    }
  },

  {
    id: "perf-056",
    domain: "Design High-Performing Architectures",
    topic: "Placement groups and HPC networking",
    difficulty: "medium",
    type: "single",
    question:
      "A research group runs a tightly coupled computational fluid dynamics simulation across 40 EC2 instances. The processes exchange messages continuously using MPI, and profiling shows that internode latency dominates the run time. The team can tolerate the loss of the whole job if a rack fails, because a failed run is simply restarted. Which configuration gives the best network performance?",
    options: [
      { id: "A", text: "Launch the instances into a cluster placement group with an Elastic Fabric Adapter attached." },
      { id: "B", text: "Launch the instances into a spread placement group so that each runs on distinct underlying hardware." },
      { id: "C", text: "Launch the instances into a partition placement group with one partition per rack of the simulation." },
      { id: "D", text: "Launch the instances across three Availability Zones and enable enhanced networking with an Elastic Network Adapter." }
    ],
    correct: ["A"],
    explanation:
      "A cluster placement group packs instances into a single Availability Zone on hardware chosen for low-latency, high-bandwidth interconnect. Elastic Fabric Adapter adds OS-bypass for MPI traffic, which is the specific accelerator for tightly coupled HPC.",
    whyWrong: {
      B: "Spread placement deliberately separates instances to reduce correlated failure, which increases the latency this workload is bound by.",
      C: "Partition placement isolates groups from each other for large distributed data stores; it does not minimise latency between all nodes.",
      D: "Spreading across Availability Zones adds inter-AZ latency, and ENA alone lacks the OS-bypass path that EFA provides."
    }
  },

  {
    id: "perf-057",
    domain: "Design High-Performing Architectures",
    topic: "Global Accelerator vs CloudFront",
    difficulty: "medium",
    type: "single",
    question:
      "A voice-over-IP provider runs media servers behind Network Load Balancers in three Regions. Traffic is UDP, entirely dynamic and not cacheable, and customers report variable quality attributed to internet routing. The provider wants clients to enter the AWS network as close to themselves as possible and needs two fixed anycast IP addresses to publish to enterprise customers for firewall allow-listing. Which service is MOST appropriate?",
    options: [
      { id: "A", text: "AWS Global Accelerator with an endpoint group per Region, providing two static anycast addresses." },
      { id: "B", text: "Amazon CloudFront with the Network Load Balancers as origins and caching disabled, using its global edge network for entry." },
      { id: "C", text: "Amazon Route 53 latency-based routing across the three Network Load Balancers, with health checks on each Region." },
      { id: "D", text: "AWS Direct Connect from each enterprise customer's premises into the nearest Region hosting a media server." }
    ],
    correct: ["A"],
    explanation:
      "Global Accelerator is the right tool for non-HTTP, non-cacheable traffic: it supports TCP and UDP, provides two static anycast IPs suited to firewall allow-listing, and routes from the nearest edge over the AWS backbone with fast failover between Regional endpoint groups.",
    whyWrong: {
      B: "CloudFront handles HTTP and HTTPS only, so it cannot carry UDP media traffic regardless of caching settings.",
      C: "Latency routing picks a Region at DNS resolution time but leaves the packets on the public internet and provides no static addresses.",
      D: "Direct Connect is a private circuit per customer site; it does not help consumer clients and would be disproportionate for allow-listing."
    }
  },

  {
    id: "perf-058",
    domain: "Design High-Performing Architectures",
    topic: "Auto Scaling policies and warm pools",
    difficulty: "hard",
    type: "single",
    question:
      "A media company's Auto Scaling group runs an application whose instances take about eight minutes to become useful because they download a large model file and warm a local cache at boot. Traffic rises sharply and predictably each weekday at 19:00, and the current target tracking policy reacts too slowly, leaving requests queued for several minutes. The company wants the delay removed without paying for full capacity all day. Which change should the architect make?",
    options: [
      { id: "A", text: "Add a warm pool of pre-initialised instances held in a stopped state for scale-out to draw from." },
      { id: "B", text: "Replace target tracking with a simple scaling policy that adds a larger fixed number of instances on each CloudWatch alarm breach." },
      { id: "C", text: "Increase the group's desired capacity permanently to the evening peak so that instances are always ready when the traffic arrives." },
      { id: "D", text: "Shorten the group's default cooldown period so successive scaling activities can launch instances more frequently." }
    ],
    correct: ["A"],
    explanation:
      "A warm pool keeps instances that have finished the expensive initialisation in a stopped state, where only storage is billed. On scale-out they are started rather than launched from scratch, which removes most of the eight-minute delay without running full capacity continuously.",
    whyWrong: {
      B: "Adding more instances per step does not shorten how long each one takes to become useful, so the queue still forms.",
      C: "Permanently sizing for peak solves the latency but is exactly the all-day cost the company wants to avoid.",
      D: "Cooldown governs the gap between scaling activities, not instance start-up time; shortening it can cause over-scaling instead."
    }
  },

  {
    id: "cost-045",
    domain: "Design Cost-Optimized Architectures",
    topic: "Cost allocation tags and budgets",
    difficulty: "medium",
    type: "single",
    question:
      "A finance team must produce a monthly chargeback report that breaks spend down to individual resource level across 30 accounts in an organization, joins it against internal project codes held in a separate system, and retains three years of history for auditors. Cost Explorer's granularity has proved insufficient. Which approach should the architect recommend?",
    options: [
      { id: "A", text: "Deliver the AWS Cost and Usage Report to Amazon S3 in Parquet and query it with Amazon Athena." },
      { id: "B", text: "Schedule monthly exports of Cost Explorer reports to CSV from each of the 30 accounts and combine them in a spreadsheet with the project codes." },
      { id: "C", text: "Create an AWS Budget per project with cost filters on the relevant tags, and use the budget reports as the chargeback record." },
      { id: "D", text: "Query the AWS Price List API for each resource type in use and multiply by resource counts collected from AWS Config."
      }
    ],
    correct: ["A"],
    explanation:
      "The Cost and Usage Report is the most granular billing data AWS publishes, down to the hour and the individual resource, covering every account in the organization. Delivered to S3 it can be queried with Athena and joined to any other dataset, and S3 handles the three-year retention cheaply.",
    whyWrong: {
      B: "Cost Explorer exports are aggregated, and repeating a manual process across 30 accounts every month is both error-prone and slow.",
      C: "Budgets are a forecasting and alerting tool. They do not produce a resource-level record suitable for chargeback or audit.",
      D: "Price List data gives list prices, ignoring discounts, Savings Plans and actual usage, so the result would not reconcile to the bill."
    }
  },

  {
    id: "cost-046",
    domain: "Design Cost-Optimized Architectures",
    topic: "S3 storage class selection",
    difficulty: "medium",
    type: "single",
    question:
      "A company stores 90 TB of customer documents in Amazon S3. Some documents are opened many times a week for years, while others are never opened again after the first fortnight, and the pattern for any given document cannot be predicted in advance. Every document must remain retrievable in milliseconds, and the team does not want to build or maintain analysis of access patterns. Which storage approach is MOST cost-effective?",
    options: [
      { id: "A", text: "Store all documents in S3 Intelligent-Tiering and let it move each object between frequent and infrequent access tiers automatically." },
      { id: "B", text: "Store documents in S3 Standard and add a lifecycle rule transitioning them to S3 Standard-IA after 30 days." },
      { id: "C", text: "Store documents in S3 Standard-IA from the outset, accepting the retrieval charge on the frequently opened documents." },
      { id: "D", text: "Store documents in S3 Standard and run a monthly job that inspects S3 access logs and copies cold objects to S3 Glacier Instant Retrieval." }
    ],
    correct: ["A"],
    explanation:
      "Intelligent-Tiering exists precisely for unpredictable access. It monitors each object and moves it between access tiers for a small per-object monitoring fee, with no retrieval charges and millisecond access in both frequent and infrequent tiers.",
    whyWrong: {
      B: "A fixed 30-day rule penalises the documents that stay hot, since reading from Standard-IA incurs a per-gigabyte retrieval charge.",
      C: "Putting everything in Standard-IA immediately means paying retrieval charges on the busiest documents and a minimum 30-day storage duration.",
      D: "This rebuilds what Intelligent-Tiering already does, adds a job to maintain, and copying objects changes their keys and modification times."
    }
  },

  {
    id: "cost-047",
    domain: "Design Cost-Optimized Architectures",
    topic: "Serverless vs container cost",
    difficulty: "medium",
    type: "single",
    question:
      "A studio renders video thumbnails in batches that arrive unpredictably. Each batch is a set of independent ECS tasks that take about fifteen minutes, and the studio is content for a task to be stopped and retried later, because the batch has no completion deadline beyond the end of the day. The studio wants the lowest possible compute cost and does not want to manage EC2 capacity. Which option should the architect choose?",
    options: [
      { id: "A", text: "Run the tasks on ECS using a Fargate Spot capacity provider, with a Fargate capacity provider as fallback for any interrupted task." },
      { id: "B", text: "Run the tasks on ECS with the standard Fargate capacity provider and purchase a Compute Savings Plan sized to the average batch." },
      { id: "C", text: "Run the tasks on ECS with the EC2 launch type on an Auto Scaling group of Spot Instances managed by the team." },
      { id: "D", text: "Run each thumbnail conversion as an AWS Lambda function invoked in parallel for every item in the batch." }
    ],
    correct: ["A"],
    explanation:
      "Fargate Spot offers a steep discount on spare capacity and suits interruptible, deadline-free work. Tasks may be reclaimed with a two-minute warning, which this workload tolerates, and no EC2 capacity has to be managed.",
    whyWrong: {
      B: "A Savings Plan discounts a committed baseline, but unpredictable batch arrivals make a commitment risky and it will not beat Spot pricing for interruptible work.",
      C: "EC2 Spot can be cheaper still but reintroduces the instance fleet the studio said it does not want to manage.",
      D: "Lambda is billed per millisecond at a higher unit rate for sustained compute, and a fifteen-minute task sits at the very edge of its timeout."
    }
  },

  {
    id: "cost-048",
    domain: "Design Cost-Optimized Architectures",
    topic: "EBS snapshot and volume cost",
    difficulty: "medium",
    type: "multi",
    question:
      "A cost review of a production fleet finds several hundred gp2 volumes, most sized well above the capacity actually used because the team had provisioned extra gigabytes purely to obtain the IOPS the applications needed. The team wants to lower storage spend while keeping at least the current performance, and cannot take the applications offline. Which TWO actions achieve this? (Select TWO.)",
    options: [
      { id: "A", text: "Modify the volumes to gp3, which decouples IOPS and throughput from provisioned capacity." },
      { id: "B", text: "Once on gp3, reduce provisioned IOPS and throughput to the levels the applications actually use, measured from CloudWatch." },
      { id: "C", text: "Modify the volumes to io2 Block Express and provision the measured IOPS against a smaller capacity for each volume." },
      { id: "D", text: "Take snapshots of each volume, delete the originals, and restore smaller volumes from the snapshots during a maintenance window." },
      { id: "E", text: "Enable EBS fast snapshot restore on the volumes so that read performance no longer depends on provisioned capacity." }
    ],
    correct: ["A", "B"],
    explanation:
      "gp3 provides a 3,000 IOPS and 125 MB/s baseline independent of size and is cheaper per gigabyte than gp2, so oversized volumes exist only to buy performance that gp3 supplies directly. Modification is online, and trimming provisioned performance to measured need removes the remaining premium.",
    whyWrong: {
      C: "io2 Block Express is a high-durability, high-IOPS class priced well above gp3; moving general-purpose volumes to it would raise cost.",
      D: "Volume size cannot be reduced by restoring a snapshot into a smaller volume, and the approach requires the downtime the team ruled out.",
      E: "Fast snapshot restore speeds up volumes created from snapshots and has its own hourly charge; it does not change a volume's performance model."
    }
  }

];
