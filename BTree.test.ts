import { describe, test, expect, beforeEach } from '@jest/globals'
import { BTree } from './BTree'

describe('BTree', () => {
  let tree: BTree<Number>

  beforeEach(() => {
    tree = new BTree(1)
  })
  test('should initialize correctly', () => {
    expect(tree.order).toBe(1)
    expect(tree.root).toBeDefined()
    expect(tree.root.keys).toEqual([])
    expect(tree.root.children).toEqual([])
  })

  test('should handle key insertion correctly', () => {
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

  describe('deleteKey', () => {
    test('should handle deletion of leaf keys', () => {
      // Prepare tree
      [5, 10, 15, 20, 25, 28, 30, 31, 32, 33, 35, 40, 45, 50, 55, 60, 65].forEach(key => tree.insert(key))

      // Simple deletion
      tree.remove(32)
      expect(tree.root.children[1].children[1].keys).toEqual([31])

      // Has to rotate leaf into parent
      tree.remove(31)
      expect(tree.root.children[1].keys).toEqual([28, 33])
      expect(tree.root.children[1].children[0].keys).toEqual([25])
      expect(tree.root.children[1].children[1].keys).toEqual([30])
      expect(tree.root.children[1].children[2].keys).toEqual([35])

      // Has to move and move parent node into leaf
      tree.remove(30)
      expect(tree.root.children[1].keys).toEqual([33])
      expect(tree.root.children[1].children[0].keys).toEqual([25, 28])
      expect(tree.root.children[1].children[1].keys).toEqual([45])
    })

    test('should handle deletion of internal key', () => {
      // Prepare tree
      [5, 10, 15, 20, 25, 28, 30, 31, 32, 33, 35, 40, 45, 50, 55, 60, 65].forEach(key => tree.insert(key))

      tree.remove(33)
      expect(tree.root.children[1].keys).toEqual([30, 32])
      expect(tree.root.children[1].children[0].keys).toEqual([25])
      expect(tree.root.children[1].children[1].keys).toEqual([31])
      expect(tree.root.children[1].children[2].keys).toEqual([35])

      tree.remove(30)
      expect(tree.root.children[1].keys).toEqual([32])
      expect(tree.root.children[1].children[0].keys).toEqual([25, 31])
      expect(tree.root.children[1].children[1].keys).toEqual([35])
    })

    test('should handle shrinking of tree after deletion', () => {
      // Prepare tree
      [5, 10, 15, 20, 30, 35, 70].forEach(key => tree.insert(key))

      tree.remove(10)
      expect(tree.root.keys).toEqual([20, 35])
      expect(tree.root.children[0].keys).toEqual([5, 35])
      expect(tree.root.children[1].keys).toEqual([30])
      expect(tree.root.children[2].keys).toEqual([70])
    })
  })
})
