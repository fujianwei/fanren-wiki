# Java 锁

## 三种加锁方式

### synchronized（已详见 synchronized与CAS.md）

```java
// 修饰方法
public synchronized void add() { count++; }

// 修饰代码块（粒度更细，推荐）
synchronized (this) { count++; }
```

---

### ReentrantLock

```java
Lock lock = new ReentrantLock();
lock.lock();
try {
    count++;
} finally {
    lock.unlock(); // 必须在 finally 里释放，防止异常导致死锁
}
```

**比 synchronized 多了什么：**
```
tryLock(timeout)：尝试加锁，超时放弃，不会死等
lockInterruptibly()：等待锁时可以被中断
公平锁：new ReentrantLock(true)，按等待顺序获取锁
Condition：更灵活的等待/唤醒机制
```

---

### 原子类（无锁，CAS 实现）

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet(); // 原子+1，不需要加锁
```

只能保证单个变量的原子操作，不需要加锁，性能最好。

---

## 三者对比

| | synchronized | ReentrantLock | 原子类 |
|------|------|------|------|
| 实现 | JVM 内置 | AQS | CAS |
| 释放锁 | 自动 | 手动（finally） | 无锁 |
| 可中断 | ❌ | ✅ | - |
| 超时获取 | ❌ | ✅ | - |
| 公平锁 | ❌ | ✅ | - |
| 适用场景 | 大多数场景 | 需要高级特性 | 单变量原子操作 |

---

## TODO：AQS

ReentrantLock 底层基于 AQS（AbstractQueuedSynchronizer）实现，待后续深挖。
