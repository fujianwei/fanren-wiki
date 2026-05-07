https://mp.weixin.qq.com/s/0Gf2DzuzgEx0i3mHVvhKNQ
https://zhuanlan.zhihu.com/p/127147909

数组+链表，相同hash的数据用链表保存在同一个数组位置

Hash的公式---> index = HashCode（Key） & （Length - 1）

数组长度的大小是 double扩容
扩容后，元素要么是在原位置，要么是在原位置再移动2次幂的位置，且链表顺序不变。

链表插入使用的是尾插法，头插法会形成环。


### Put方法

1.对key的hashCode()做hash运算，计算index;  
2.如果没碰撞直接放到bucket⾥；  
3.如果碰撞了，以链表的形式存在buckets后；  
4.如果碰撞导致链表过⻓(⼤于等于TREEIFY_THRESHOLD)，就把链表转换成红⿊树(JDK1.8中的改动)；  
5.如果节点已经存在就替换old value(保证key的唯⼀性)  
6.如果bucket满了(超过load factor*current capacity)，就要resize

### get方法

1.对key的hashCode()做hash运算，计算index;  
2.如果在bucket⾥的第⼀个节点⾥直接命中，则直接返回；  
3.如果有冲突，则通过key.equals(k)去查找对应的Entry;  
4. 若为树，则在树中通过key.equals(k)查找，O(logn)；  
5. 若为链表，则在链表中通过key.equals(k)查找，O(n)。