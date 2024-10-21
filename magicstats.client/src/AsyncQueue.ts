class AsyncQueue<T> {
    queue: { (): Promise<T> } [] = [];
    processing = new Set<Promise<T>>();
    started: Promise<T>[] = [];
    maxProcessing = 3;

    enqueue(promiseFactory: () => Promise<T>) {
        this.queue.push(promiseFactory);
        this.startNext();
    }

    dequeue(): Promise<T> | undefined {
        return this.started.shift();
    }

    private startNext() {
        if (this.processing.size >= this.maxProcessing) {
            return;
        }
        const factory = this.queue.shift();
        if (!factory) {
            return;
        }
        const promise = factory();
        this.processing.add(promise);
        this.started.push(promise);
        promise.finally(() => {
            this.processing.delete(promise);
            this.startNext();
        })
    }
}

export default AsyncQueue;