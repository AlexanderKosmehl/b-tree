import { describe, test, expect, beforeEach } from '@jest/globals'
import { BTree } from './BTree'

describe('BTree', () => {
  let tree: BTree<Number>

  beforeEach(() => {
    tree = new BTree(1)
  })
  test('should initialize the tree', () => {
    expect(tree.order).toBe(1)
    expect(tree.root).toBeDefined()
    expect(tree.root.keys).toEqual([])
    expect(tree.root.children).toEqual([])
  })

  test('should insert keys and balance tree automatically', () => {
    tree.insert(8)
    expect(tree.root.keys).toEqual([8])

    tree.insert(9)
    expect(tree.root.keys).toEqual([8, 9])

    tree.insert(10)
    expect(tree.root.keys).toEqual([9])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10])

    tree.insert(11)
    expect(tree.root.keys).toEqual([9])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10, 11])

    tree.insert(15)
    expect(tree.root.keys).toEqual([9, 11])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10])
    expect(tree.root.children[2].keys).toEqual([15])

    tree.insert(20)
    expect(tree.root.keys).toEqual([9, 11])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10])
    expect(tree.root.children[2].keys).toEqual([15, 20])

    tree.insert(17)
    expect(tree.root.keys).toEqual([11])
    expect(tree.root.children[0].keys).toEqual([9])
    expect(tree.root.children[0].children[0].keys).toEqual([8])
    expect(tree.root.children[0].children[1].keys).toEqual([10])
    expect(tree.root.children[1].keys).toEqual([17])
    expect(tree.root.children[1].children[0].keys).toEqual([15])
    expect(tree.root.children[1].children[1].keys).toEqual([20])
  })

  test('should delete keys and rebalance tree automatically', () => {
    // Prepare tree
    [5, 8, 3, 9, 2, 6, 7, 10].forEach(key => tree.insert(key))

    // Remove some keys
    tree.remove(6)
    expect(tree.root.keys).toEqual([5, 8])
    expect(tree.root.children[1].keys).toEqual([7])

    tree.remove(7)
    expect(tree.root.keys).toEqual([3, 8])
    expect(tree.root.children[0].keys).toEqual([2])
    expect(tree.root.children[1].keys).toEqual([5])

    tree.remove(2)
    expect(tree.root.keys).toEqual([8])
    expect(tree.root.children[0].keys).toEqual([3, 5])
    expect(tree.root.children[1].keys).toEqual([9, 10])

    tree.remove(8)
    expect(tree.root.keys).toEqual([5])
    expect(tree.root.children[0].keys).toEqual([3])
    expect(tree.root.children[1].keys).toEqual([9, 10])

    // Remove rest of the keys
    ;[5, 3, 9, 2, 10].forEach(key => tree.remove(key))
    expect(tree.root.keys).toEqual([])
    expect(tree.root.children).toEqual([])
  })

  describe('helper functions', () => {
    test('getHeight', () => {
      [8, 9, 10, 11, 15, 20, 17].forEach(key => tree.insert(key))

      expect(tree.getHeight()).toBe(3)
    })

    test('contains', () => {
      [8, 9, 10, 11, 15, 20, 17].forEach(key => tree.insert(key))

      expect(tree.contains(17)).toBe(true)
      expect(tree.contains(8)).toBe(true)

      expect(tree.contains(3)).toBe(false)
      expect(tree.contains(0)).toBe(false)
    })
  })
})
