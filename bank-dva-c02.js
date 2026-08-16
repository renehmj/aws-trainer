/*
 * DVA-C02 — Developer Associate question bank.
 *
 * Domains (must match certs.js exactly):
 *   "Development with AWS Services"      32%
 *   "Security"                           26%
 *   "Deployment"                         24%
 *   "Troubleshooting and Optimization"   18%
 *
 * Seeded so the path is usable immediately. Grow it the same way as SAA:
 * reuse `topic` strings across questions on the same concept so the Subjects
 * view builds up real subjects rather than one-question stubs.
 */

window.BANKS = window.BANKS || {};
window.BANKS["DVA-C02"] = [

  /* ---------- Development with AWS Services (32%) ---------- */

  {
    id: "dev-001",
    domain: "Development with AWS Services",
    topic: "DynamoDB query vs scan",
    difficulty: "easy",
    type: "single",
    question:
      "A developer stores orders in a DynamoDB table with partition key customerId and sort key orderDate. The 'recent orders' endpoint currently calls Scan with a filter expression on customerId and has become slow and expensive as the table grew to 40 million items. What is the correct fix?",
    options: [
      { id: "A", text: "Call Query with a key condition expression on customerId and a sort key condition on orderDate." },
      { id: "B", text: "Keep Scan but increase the table's provisioned read capacity and enable parallel scan segments." },
      { id: "C", text: "Add a filter expression on orderDate in addition to customerId so fewer items are returned." },
      { id: "D", text: "Enable DynamoDB Streams and rebuild the endpoint to read from the stream." }
    ],
    correct: ["A"],
    explanation:
      "Query reads only the items under a given partition key, so cost and latency scale with the items returned rather than with table size. Because customerId is the partition key and orderDate is the sort key, the access pattern is exactly what the table was designed for.",
    whyWrong: {
      B: "Scan reads every item in the table before filtering. Parallel segments and more capacity make an inherently full-table read faster and more expensive, not correct.",
      C: "Filter expressions are applied after items are read, so consumed capacity is unchanged. Filters never reduce the cost of a Scan.",
      D: "Streams deliver a time-ordered change log for reacting to writes; they are not a mechanism for querying current data by key."
    }
  },

  {
    id: "dev-002",
    domain: "Development with AWS Services",
    topic: "DynamoDB conditional writes",
    difficulty: "medium",
    type: "single",
    question:
      "Two instances of an application occasionally update the same DynamoDB inventory item at the same time, and one update silently overwrites the other. The developer must ensure a write only succeeds if the item has not changed since it was read, without introducing another service. What should they implement?",
    options: [
      { id: "A", text: "A version attribute on the item plus a ConditionExpression asserting the stored version still matches the one that was read." },
      { id: "B", text: "A DynamoDB transaction wrapping the single PutItem call." },
      { id: "C", text: "Provisioned capacity increases so both writes have enough throughput to complete." },
      { id: "D", text: "A global secondary index on the version attribute, queried before each write." }
    ],
    correct: ["A"],
    explanation:
      "This is optimistic locking. The item carries a version attribute, and every update sends a ConditionExpression requiring the stored version to equal the value the caller read. If another writer got there first the condition fails and the write is rejected, so the caller can re-read and retry instead of silently clobbering.",
    whyWrong: {
      B: "Transactions give all-or-nothing semantics across multiple items. A transaction around one write still overwrites whatever is there unless a condition is attached.",
      C: "Throughput is not the problem — both writes succeed today. The problem is that the second one overwrites the first.",
      D: "Reading the version through an index before writing leaves a race between the read and the write; only a condition evaluated atomically at write time closes it."
    }
  },

  /* ---------- Security (26%) ---------- */

  {
    id: "dsec-001",
    domain: "Security",
    topic: "Cognito user pools vs identity pools",
    difficulty: "medium",
    type: "single",
    question:
      "A mobile app must let users sign up and sign in with an email and password, and must then allow the signed-in user's device to upload directly to a private S3 prefix scoped to that user. Which Cognito configuration meets both needs?",
    options: [
      { id: "A", text: "A user pool for sign-up and sign-in, and an identity pool that exchanges the user pool token for temporary AWS credentials scoped by an IAM role." },
      { id: "B", text: "A user pool alone — its access token can be sent directly to S3 as the request signature." },
      { id: "C", text: "An identity pool alone, using unauthenticated identities for every user." },
      { id: "D", text: "A user pool alone, with the app embedding an IAM user's access keys to perform uploads on the user's behalf." }
    ],
    correct: ["A"],
    explanation:
      "The two Cognito components do different jobs. A user pool is the user directory that handles registration, sign-in, and token issuance. An identity pool takes that token and returns temporary AWS credentials tied to an IAM role, whose policy can scope access to a per-user S3 prefix using a policy variable.",
    whyWrong: {
      B: "S3 authenticates SigV4-signed requests using AWS credentials. A user pool token is not an AWS credential and cannot sign an S3 request.",
      C: "Unauthenticated identities give every guest the same role, which cannot scope a prefix to a specific user and defeats the sign-in requirement.",
      D: "Embedding IAM access keys in a mobile app exposes them to anyone who inspects the binary, and gives every user identical permissions."
    }
  },

  {
    id: "dsec-002",
    domain: "Security",
    topic: "KMS envelope encryption",
    difficulty: "hard",
    type: "single",
    question:
      "An application must encrypt 500 MB files before writing them to S3, using a customer managed KMS key so decryption is auditable. Calls to the KMS Encrypt API fail for these payloads. What is the correct approach?",
    options: [
      { id: "A", text: "Call GenerateDataKey, encrypt the file locally with the returned plaintext data key, then store the encrypted data key alongside the object and discard the plaintext key." },
      { id: "B", text: "Split the file into 4 KB chunks and call Encrypt once per chunk." },
      { id: "C", text: "Request a KMS service quota increase for the maximum payload size." },
      { id: "D", text: "Switch to an AWS managed key, which has no payload size limit." }
    ],
    correct: ["A"],
    explanation:
      "This is envelope encryption, and it is why GenerateDataKey exists. KMS returns both a plaintext data key and an encrypted copy of it; the application encrypts the payload locally with the plaintext key, stores the encrypted key with the ciphertext, and discards the plaintext. Decryption calls KMS only to unwrap the small data key, which keeps the CloudTrail audit trail intact.",
    whyWrong: {
      B: "This would mean over 100,000 KMS calls per file, with matching cost and latency, and leaves the application managing chunk boundaries for no benefit.",
      C: "The 4 KB limit on direct Encrypt is a design constraint of the API, not an adjustable quota.",
      D: "The payload limit applies to the Encrypt operation regardless of key type, and an AWS managed key would also lose the per-key control the audit requirement implies."
    }
  },

  /* ---------- Deployment (24%) ---------- */

  {
    id: "dep-001",
    domain: "Deployment",
    topic: "Lambda traffic shifting with CodeDeploy",
    difficulty: "medium",
    type: "single",
    question:
      "A team wants new Lambda function versions to receive 10 percent of traffic for five minutes before the remaining traffic shifts, and wants an automatic return to the previous version if the function's error alarm fires during that window. What should they configure?",
    options: [
      { id: "A", text: "A CodeDeploy deployment group for the Lambda alias using the Canary10Percent5Minutes configuration with a CloudWatch alarm as a rollback trigger." },
      { id: "B", text: "Two Lambda functions behind an Application Load Balancer with weighted target groups." },
      { id: "C", text: "Publish the new version and update the alias to point at it directly, monitoring manually." },
      { id: "D", text: "Lambda provisioned concurrency on the new version so it absorbs traffic gradually." }
    ],
    correct: ["A"],
    explanation:
      "CodeDeploy shifts traffic between two versions behind a Lambda alias using predefined configurations, and Canary10Percent5Minutes matches the stated pattern exactly. Attaching a CloudWatch alarm to the deployment group makes CodeDeploy roll traffic back automatically if the alarm goes off during the deployment.",
    whyWrong: {
      B: "An ALB with weighted targets can split traffic but adds infrastructure, does not use the alias mechanism Lambda already provides, and gives no automatic rollback.",
      C: "Repointing the alias is an instant 100 percent cutover with no canary window and no automated rollback.",
      D: "Provisioned concurrency pre-initialises execution environments to cut cold starts. It has nothing to do with routing a percentage of traffic."
    }
  },

  {
    id: "dep-002",
    domain: "Deployment",
    topic: "Elastic Beanstalk deployment policies",
    difficulty: "medium",
    type: "single",
    question:
      "An Elastic Beanstalk web environment must be updated with zero reduction in capacity during the deployment, and a failed deployment must not leave any updated instances serving traffic. Deployment duration is not a concern. Which deployment policy should the team choose?",
    options: [
      { id: "A", text: "Immutable" },
      { id: "B", text: "Rolling" },
      { id: "C", text: "All at once" },
      { id: "D", text: "Rolling with additional batch" }
    ],
    correct: ["A"],
    explanation:
      "The immutable policy launches a full set of new instances in a temporary Auto Scaling group, and only moves them into the original group once they pass health checks. Existing capacity is untouched throughout, and a failure is discarded by terminating the temporary group, so no updated instance ever serves traffic.",
    whyWrong: {
      B: "Rolling updates batches of existing instances in place, so capacity drops while a batch is out, and a failure leaves already-updated instances in service.",
      C: "All at once updates every instance simultaneously, causing an outage, and a failure takes the whole environment down.",
      D: "Rolling with additional batch preserves capacity, but it still updates existing instances in place, so a failed deployment can leave updated instances serving traffic."
    }
  },

  /* ---------- Troubleshooting and Optimization (18%) ---------- */

  {
    id: "tro-001",
    domain: "Troubleshooting and Optimization",
    topic: "Lambda cold starts",
    difficulty: "medium",
    type: "single",
    question:
      "A latency-sensitive API backed by Lambda meets its p50 target but badly misses p99, and traces show the slow requests spending several hundred milliseconds initialising the runtime and loading dependencies before the handler runs. Traffic is steady during business hours. What is the most direct fix?",
    options: [
      { id: "A", text: "Configure provisioned concurrency on the function's alias to keep initialised environments warm." },
      { id: "B", text: "Increase the function timeout so slow invocations have room to complete." },
      { id: "C", text: "Move dependency imports from module scope into the handler body." },
      { id: "D", text: "Enable reserved concurrency to guarantee the function a share of account concurrency." }
    ],
    correct: ["A"],
    explanation:
      "The symptom described — initialisation before the handler runs, hitting only the tail of the distribution — is a cold start. Provisioned concurrency keeps a configured number of execution environments initialised and ready, which removes that initialisation from the request path. Steady traffic makes it economical.",
    whyWrong: {
      B: "Timeout is the ceiling before an invocation is killed. Raising it does not make anything faster.",
      C: "This is backwards: code in module scope runs once per environment and is reused, while moving it into the handler makes it run on every invocation.",
      D: "Reserved concurrency caps and guarantees how many concurrent executions a function may have. It does not pre-initialise anything, so cold starts remain."
    }
  },

  {
    id: "tro-002",
    domain: "Troubleshooting and Optimization",
    topic: "Distributed tracing with X-Ray",
    difficulty: "medium",
    type: "single",
    question:
      "A request path spans API Gateway, a Lambda function, a DynamoDB table, and an external payment API. End-to-end latency has doubled and the team cannot tell which hop is responsible from CloudWatch metrics alone. What should they implement to isolate it?",
    options: [
      { id: "A", text: "Enable AWS X-Ray tracing and instrument the function with the X-Ray SDK so each downstream call becomes a timed subsegment on a service map." },
      { id: "B", text: "Raise the Lambda log level to DEBUG and grep CloudWatch Logs for slow requests." },
      { id: "C", text: "Enable CloudWatch detailed monitoring at one-minute granularity on every service in the path." },
      { id: "D", text: "Turn on API Gateway access logging and calculate latency from the log timestamps." }
    ],
    correct: ["A"],
    explanation:
      "X-Ray is built for exactly this: it correlates one request across services using a trace ID and records each downstream call as a timed subsegment, including calls to external HTTP endpoints. The service map then shows latency per hop, which is what identifies the offending component.",
    whyWrong: {
      B: "Ad-hoc log statements give unstructured, uncorrelated timings and require code changes at every hop to approximate what tracing does natively.",
      C: "Detailed monitoring improves metric resolution per service but still leaves per-service aggregates that cannot be stitched into a single request's path.",
      D: "API Gateway logs report integration latency for its own hop only, so they cannot distinguish DynamoDB time from payment-API time inside the function."
    }
  }

];
