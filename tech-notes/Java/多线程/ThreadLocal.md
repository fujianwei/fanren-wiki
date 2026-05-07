# ThreadLocal

## 是什么

线程本地变量，每个线程有自己独立的变量副本，线程之间互不影响。

**和 synchronized/CAS 的本质区别：**
```
synchronized/CAS：让多线程安全地共享同一份数据，解决竞争问题
ThreadLocal：     让多线程彻底不共享数据，每个线程有自己的副本
```

ThreadLocal 解决的不是"共享变量的安全访问"，而是"根本不需要共享"：
```
共享变量场景：线程A和B都要操作同一个计数器 → 用锁
ThreadLocal场景：每个请求有自己的用户信息，互不影响 → 用ThreadLocal
```

---

## 典型使用场景

存当前请求的登录用户信息，业务代码任意地方取用，不用层层传参：

```java
public class UserContext {
    private static ThreadLocal<User> currentUser = new ThreadLocal<>();

    public static void set(User user) { currentUser.set(user); }
    public static User get() { return currentUser.get(); }
    public static void remove() { currentUser.remove(); }
}

// 请求进来时存入
UserContext.set(loginUser);

// 业务代码任意地方取用
User user = UserContext.get();

// 请求结束时清除
UserContext.remove();
```

---

## 原理

每个 Thread 对象内部有一个 ThreadLocalMap：
```
key = ThreadLocal 对象
value = 该线程存的值

线程A set(value1) → 存在线程A的 map 里
线程B set(value2) → 存在线程B的 map 里
互不影响
```

---

## 注意：用完必须 remove()

线程池场景下线程会被复用，上一个请求存的数据还在，会污染下一个请求：
```
请求1：UserContext.set(user1) → 业务处理完，忘了 remove
线程被线程池回收复用
请求2：UserContext.get() → 拿到的是 user1 ← 数据污染
```

所以一定要在请求结束时调用 `remove()` 清除数据。
