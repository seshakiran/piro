# Piro Cloud Connectors

## AWS (Primary)

### Lambda Deployment

```typescript
await piro.deployLambda({
  functionName: 'my-function',
  runtime: 'nodejs18.x',
  handler: 'index.handler',
  code: {
    uri: 's3://my-bucket/function.zip',
  },
  memorySize: 256,
  timeout: 30,
});
```

### ECS/Fargate

```typescript
await piro.deployEcs({
  cluster: 'my-cluster',
  service: 'my-service',
  taskDefinition: 'my-task',
  containerName: 'app',
  image: 'my-registry/my-image:latest',
  desiredCount: 2,
});
```

### S3 Sync

```typescript
await piro.syncToS3({
  bucket: 'my-bucket',
  localPath: './dist',
  prefix: 'assets/',
});
```

### CloudFormation

```typescript
await piro.deployCloudFormation({
  stackName: 'my-stack',
  template: fs.readFileSync('template.yaml', 'utf8'),
  parameters: { Environment: 'prod' },
});
```

## GCP

### Cloud Functions

```typescript
await piro.deployGcpFunction({
  name: 'my-function',
  runtime: 'nodejs18',
  entryPoint: 'handler',
  source: '.',
});
```

### Cloud Run

```typescript
await piro.deployGcpRun({
  name: 'my-service',
  image: 'gcr.io/project/image',
  port: 8080,
});
```

## Azure

### Azure Functions

```typescript
await piro.deployAzureFunction({
  name: 'my-function',
  runtime: 'node',
  source: '.',
});
```

### Container Instances

```typescript
await piro.deployAzureContainer({
  name: 'my-container',
  image: 'my-registry/image:latest',
  cpu: 1.0,
  memory: 1.5,
});
```