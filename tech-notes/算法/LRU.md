# LRU 算法

## 核心思想

Least Recently Used，最近最少使用。核心规则：
- 每次访问一个数据，把它移到队头（表示最新使用）
- 缓存满了，淘汰队尾的数据（表示最久没用）

## 执行过程举例

容量为 3，依次操作：
```
put(1) → [1]
put(2) → [2,1]
put(3) → [3,2,1]

get(1) → 访问1，移到头部 → [1,3,2]

put(4) → 容量满了，淘汰队尾2 → [4,1,3]
```

## 数据结构

**双向链表 + HashMap** 组合：
- HashMap：O(1) 定位节点
- 双向链表：O(1) 移动/删除节点，维护访问顺序（头部最新，尾部最旧）

单独用链表：O(N) 查找；单独用 HashMap：无法维护顺序。两者结合才能 O(1)。

## 虚拟头尾节点的作用

head 和 tail 永远存在，插入/删除时无需判断链表是否为空，消除边界判断：
```java
// 无虚拟节点，插入头部需判断是否为空
if (head == null) { head = node; tail = node; }
else { node.next = head; head.prev = node; head = node; }

// 有虚拟节点，直接操作
node.next = head.next;
node.prev = head;
head.next.prev = node;
head.next = node;
```

## Java 实现

```java
public class LRUCache {
    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0); // 虚拟头节点
    private final Node tail = new Node(0, 0); // 虚拟尾节点

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        moveToHead(node); // 访问即移到头部
        return node.val;
    }

    public void put(int key, int val) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.val = val;
            moveToHead(node);
        } else {
            Node node = new Node(key, val);
            map.put(key, node);
            addToHead(node);
            if (map.size() > capacity) {
                Node removed = removeTail(); // 淘汰最久未使用
                map.remove(removed.key);
            }
        }
    }

    private void addToHead(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    private void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void moveToHead(Node node) {
        removeNode(node);
        addToHead(node);
    }

    private Node removeTail() {
        Node node = tail.prev;
        removeNode(node);
        return node;
    }

    static class Node {
        int key, val;
        Node prev, next;
        Node(int key, int val) { this.key = key; this.val = val; }
    }
}
```

## 关键点

- 虚拟头尾节点简化边界处理，无需判断链表为空
- get/put 均为 O(1)
- Java 中也可直接用 `LinkedHashMap` 实现，重写 `removeEldestEntry` 即可
