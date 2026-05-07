# volatile

**解决：可见性 + 有序性，不保证原子性**

---

## 可见性原理

```
没有 volatile：
线程A 修改 flag=true → 写到自己的 CPU 缓存
线程B 读 flag        → 读的是自己的 CPU 缓存（还是 false）
→ 线程B 看不到线程A 的修改

有 volatile：
线程A 修改 flag=true → 立即刷新到主内存，并通知其他 CPU 缓存失效
线程B 读 flag        → 发现缓存失效，强制从主内存读
→ 线程B 能看到最新值
```

---

## 有序性原理（禁止指令重排）

volatile 通过**内存屏障**禁止重排：
```
写 volatile 变量前：插入 StoreStore 屏障，前面的写操作不能重排到后面
写 volatile 变量后：插入 StoreLoad 屏障，后面的读操作不能重排到前面
读 volatile 变量前：插入 LoadLoad 屏障
读 volatile 变量后：插入 LoadStore 屏障
```

**典型场景：DCL 单例**
```java
public class Singleton {
    private static volatile Singleton instance; // 必须加 volatile

    public static Singleton getInstance() {
        if (instance == null) {                  // 第一次检查
            synchronized (Singleton.class) {
                if (instance == null) {          // 第二次检查
                    instance = new Singleton();  // 没有volatile会被重排
                }
            }
        }
        return instance;
    }
}
```

没有 volatile，`new Singleton()` 可能被重排：
```
正常顺序：分配内存 → 初始化对象 → 引用指向内存
重排后：  分配内存 → 引用指向内存 → 初始化对象

线程B 看到 instance 不为 null（引用已指向内存）
但对象还没初始化 → 使用了未完成的对象 → 出错
```

---

## 不保证原子性

```java
volatile int count = 0;
count++; // 读→加1→写，三步不是原子的，多线程下仍有问题

// 解决：用 AtomicInteger
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet(); // 原子操作
```

---

## 适用场景

```
状态标志位：
volatile boolean stop = false;
线程A：stop = true;
线程B：while (!stop) { ... } // 能及时感知到 stop 变化

DCL 单例：防止对象未初始化就被使用

不适合：需要原子操作的场景（计数器等）
```
