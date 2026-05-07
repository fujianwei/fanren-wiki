# JVM

## 内存模型

```
┌─────────────────────────────────────┐
│              堆（Heap）               │  ← 最大的区域，GC 主要管这里
│   新生代（Eden + S0 + S1）            │
│   老年代                             │
├─────────────────────────────────────┤
│           方法区（Method Area）        │  ← 存类信息、常量、静态变量
├─────────────────────────────────────┤
│        虚拟机栈（JVM Stack）           │  ← 每个线程一个，存方法调用
├─────────────────────────────────────┤
│        本地方法栈（Native Stack）      │  ← native 方法用
├─────────────────────────────────────┤
│        程序计数器（PC Register）       │  ← 记录当前执行到哪行
└─────────────────────────────────────┘
```

**线程私有：** 虚拟机栈、本地方法栈、程序计数器
**线程共享：** 堆、方法区

---

## 堆

**存什么：** 所有对象实例、数组

**分配比例：**
```
新生代 : 老年代 = 1 : 2
新生代内部 Eden : S0 : S1 = 8 : 1 : 1
```

**对象流转过程：**
```
新对象 → Eden 区
Eden 满了 → 触发 Minor GC
  存活对象 → 移到 S0
  下次 Minor GC → 存活对象移到 S1，年龄+1
  年龄达到 15（默认）→ 晋升老年代

老年代满了 → 触发 Full GC（代价很大）
```

**Survivor 区（S0/S1）的作用：**
```
新生代 = Eden（8/10）+ S0（1/10）+ S1（1/10）

Minor GC 后，Eden 存活对象 → 复制到 S0
下次 Minor GC，Eden + S0 存活对象 → 复制到 S1，年龄+1
下次 Minor GC，Eden + S1 存活对象 → 复制到 S0，年龄+1
...每次 GC 在 S0/S1 之间来回复制，年龄不断增长

为什么要两个 Survivor？
→ 每次 GC 把存活对象从一个区完整复制到另一个区
→ 源区域直接清空，没有内存碎片
→ 内存始终连续
```

**什么情况对象直接进老年代：**
```
1. 大对象：超过 -XX:PretenureSizeThreshold，直接进老年代
2. 长期存活：年龄超过 15
3. 动态年龄判断：Survivor 中相同年龄对象总大小 > Survivor 空间（S0或S1）一半
                → 该年龄及以上的对象直接晋升
                → 本质是自适应优化，主动晋升避免 Survivor 被撑满溢出导致 Full GC
4. 空间分配担保失败：Minor GC 前老年代剩余空间 < 新生代所有对象总大小
                   → 直接触发 Full GC
```

**常见 OOM 及排查思路：**

**java.lang.OutOfMemoryError: Java heap space**
```
原因1：内存泄漏 → 对象一直被引用无法回收
  典型：静态集合一直加对象没清理
  典型：ThreadLocal 用完没有 remove

原因2：内存溢出 → 对象太多，堆真的不够
  典型：一次性查询几百万条数据加载到内存
  典型：堆大小配置太小

排查：
1. 看 GC 日志：Full GC 后内存有没有降下来
   → 不降：内存泄漏
   → 降了但很快又涨：对象创建太快，堆太小
2. OOM 时自动 dump：-XX:+HeapDumpOnOutOfMemoryError
3. 用 MAT 分析 dump：找占用最大的对象 → 看引用链 → 定位代码
```

**java.lang.OutOfMemoryError: PermGen space / Metaspace**
```
原因：动态生成大量类（反射、CGLib动态代理、JSP编译）
     每次生成新类，类信息堆积在方法区

排查：
1. 检查是否大量使用动态代理，注意复用
2. 检查 -XX:MaxMetaspaceSize 是否设置太小
3. jmap -clstats 查看加载的类数量是否异常
```

**java.lang.StackOverflowError**
```
原因：递归太深，栈帧太多
排查：看堆栈信息，找递归调用链，检查递归终止条件
```

**排查工具：**
```
jps：    查看 Java 进程
jmap：   查看堆内存、dump 快照
jstack： 查看线程栈，排查死锁
jstat：  查看 GC 统计信息
MAT：    分析堆内存 dump 文件
Arthas： 阿里开源，线上诊断神器
```

---

## 虚拟机栈

每个线程独有，存方法调用信息。每调用一个方法，压入一个**栈帧**：

```
main() 调用 methodA() 调用 methodB()

栈：
┌──────────┐  ← 栈顶
│ methodB  │
├──────────┤
│ methodA  │
├──────────┤
│  main    │
└──────────┘

methodB 执行完 → 弹出栈帧 → 回到 methodA
```

每个栈帧包含：
```
局部变量表：方法里的局部变量
操作数栈：  计算中间结果
返回地址：  方法执行完回到哪里
```

**StackOverflowError**：递归太深，栈帧太多，栈空间不够。

---

## 方法区

**存什么：** 类的元信息（类名、方法、字段）、运行时常量池、静态变量、JIT 编译后的代码

**永久代 vs 元空间：**
```
JDK7 永久代：在堆内，大小固定（-XX:MaxPermSize）
  → 动态生成大量类（反射、动态代理）容易 OOM：PermGen space

JDK8 元空间：在本地内存，大小动态扩展，默认无上限
  → 不容易 OOM，可用 -XX:MaxMetaspaceSize 限制
```

**字符串常量池位置变化：**
```
JDK7 之前：字符串常量池在方法区
JDK7 之后：字符串常量池移到堆里
原因：方法区大小固定，字符串太多容易 OOM，移到堆里可以被 GC 回收
```

**双亲委派模型：**

类加载器负责把 .class 文件加载到 JVM，分三层：
```
BootstrapClassLoader  ← 加载 JDK 核心类（String、Object等）
    ↑
ExtClassLoader        ← 加载 JDK 扩展类
    ↑
AppClassLoader        ← 加载我们自己写的类
    ↑
自定义类加载器
```

加载规则：**不自己先加载，先委托父加载器，父加载器失败才自己加载：**
```
AppClassLoader 要加载 String
→ 先委托 ExtClassLoader
→ ExtClassLoader 先委托 BootstrapClassLoader
→ BootstrapClassLoader 发现 String 已加载 → 直接返回 JDK 的 String
→ 你自己写的 java.lang.String 永远不会生效
```

**为什么这样设计：**
```
没有双亲委派：
  AppClassLoader 直接加载你写的 java.lang.String
  → 替换了 JDK 的 String → 系统崩溃或被恶意攻击

有双亲委派：
  核心类只能由 BootstrapClassLoader 加载
  → 无法被替换，保证安全
```

**一句话：双亲委派保证核心类只能由 JDK 自己加载，不能被篡改。**

---

## 程序计数器

记录当前线程执行到哪条字节码指令，线程切换后能恢复执行位置。

**唯一不会 OOM 的区域。**

---

## 对象创建过程

```
1. 类加载检查：这个类有没有被加载过？没有先加载
2. 分配内存：在堆上分配内存（Eden 区）
3. 初始化零值：int→0，boolean→false，引用→null
4. 设置对象头：存 hashCode、GC 年龄、锁状态等
5. 执行 <init>：执行构造方法，赋真正的初始值
```
