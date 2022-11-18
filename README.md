# K8s Learnathon // Kubernetes and Microservices
Simple microservice boilerplate.

## Description
Pinger is an app which continuously calls any URL, to check if it's up or not. 
It also records the latency, response code, size etc.

This app has 3 services:

 - `frontend` - which provides the UI, and calls different APIs
 - `pinger` - runs a loop and calls the list of URLs provided by the UI and records all stats
 - `details` - service which providers more details about a URL

## Getting Started

Start by installing a local kubernetes cluster using `kind`: https://kind.sigs.k8s.io/

### Setting up Local K8s Cluster
A sample cluster configuration can be found in: `k8s/cluster/kind-cluster-config.yaml`

This creates a 3 node cluster along with a control plane.

Example:
 
```
 kind create cluster --config k8s/cluster/kind-cluster-config.yaml
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.20.2) 🖼
 ✓ Preparing nodes 📦 📦 📦 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
 ✓ Joining worker nodes 🚜
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
```

Check using:
 
```
$ kubectl get no --context kind-kind
NAME                 STATUS   ROLES                  AGE     VERSION
kind-control-plane   Ready    control-plane,master   2m50s   v1.20.2
kind-worker          Ready    <none>                 2m16s   v1.20.2
kind-worker2         Ready    <none>                 2m16s   v1.20.2
kind-worker3         Ready    <none>                 2m16s   v1.20.2
```

### Building Docker Images
Now, that you have a cluster running...
Let's build the application and load the images into the cluster.

`./scripts/build-docker.sh` - This script build and uploads the images to the kind cluster.

Now, if you want to do it yourself, follow this [guide](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster)

### Deploying Application
Check the sample deployment configuration. This has basic k8s deployment and service spec. 
`k8s/configs/pinger-all-in-one.yaml`


Example:
 
```
$ kubectl apply -f k8s/configs/pinger-all-in-one.yaml
deployment.apps/frontend created
service/frontend-service created
deployment.apps/details created
service/details-service created
deployment.apps/pinger-v1 created
service/pinger-v1-service created
deployment.apps/pinger-v2 created
service/pinger-v2-service created
```
Verify if everything was successfully created.


Check pods:
 
```
$ kubectl get po
NAME                         READY   STATUS    RESTARTS   AGE
details-77498f8c7d-gvqcm     1/1     Running   0          10m
frontend-7486854785-4rpm4    1/1     Running   0          10m
pinger-v1-7bcc658775-ftbfs   1/1     Running   0          10m
pinger-v2-fff76cdc-85j5j     1/1     Running   0          10m
```


Check services:
 
```
$ kubectl get svc 
NAME                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
details-service     ClusterIP   10.96.242.219   <none>        4000/TCP   10m
frontend-service    ClusterIP   10.96.111.87    <none>        9000/TCP   10m
kubernetes          ClusterIP   10.96.0.1       <none>        443/TCP    72m
pinger-v1-service   ClusterIP   10.96.10.155    <none>        3000/TCP   10m
pinger-v2-service   ClusterIP   10.96.152.94    <none>        3000/TCP   10m
```


Check deployments:
 
```
$ kubectl get deploy
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
details     1/1     1            1           11m
frontend    1/1     1            1           11m
pinger-v1   1/1     1            1           11m
pinger-v2   1/1     1            1           11m
```

### Checking Application

Let's expose the application locally and check if things are working together correctly.

Get the pod name for `frontend`:
 
```
$ kubectl get po | grep frontend
frontend-7486854785-4rpm4    1/1     Running   0          13m
```

Let's forward this to the local machine:
 
```
$ kubectl port-forward frontend-7486854785-4rpm4 9000:9000
Forwarding from 127.0.0.1:9000 -> 9000
Forwarding from [::1]:9000 -> 9000
```

Now open you browser: http://localhost:9000
You should be able to see the page.

Here, we used `kubectl port-forward <pod-name> <local-port>:<remote-port>` to forward local connections
to the container running in the cluster. 

### Application Structure
Here, the `frontend` pod calls the `pinger` and `details` service. 

`frontend` service's deployment configuration has the following environment variable:
 
```
      containers:
      - name: frontend
        image: localhost/frontend:v1
        env:
        - name: PINGER_BASE_URL
          value: "http://pinger-v1-service:3000"
        - name: DETAILS_BASE_URL
          value: "http://details-service:4000"
        ports:
```
 
In the sample configuration, they are calling the service names configured for the other deployments.
Thus, the frontend, inside k8s, will use these internal DNS names to access `pinger` and `details` service.

These variables can be changed to point to the correct services. 
If one of the services isn't working as expected,
the UI would show error messages. You can try this by deleting some service or deployment.


### Checking logs
For checking logs of a pod, use:
`kubectl logs -f <pod-name>`

Example:
 
```
$ kubectl logs -f frontend-7486854785-4rpm4
2021-05-06T22:05:29.573Z | Frontend listening at: 9000
::ffff:172.18.0.3 - - [06/May/2021:22:14:25 +0000] "GET / HTTP/1.1" 200 6351 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
```

### Kubectl Reference
https://kubernetes.io/docs/reference/kubectl/cheatsheet/

