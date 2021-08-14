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

  test('should insert keys correctly', () => {
    tree.insertKey(8)
    expect(tree.root.keys).toEqual([8])

    tree.insertKey(9)
    expect(tree.root.keys).toEqual([8, 9])

    tree.insertKey(10)
    expect(tree.root.keys).toEqual([9])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10])

    tree.insertKey(11)
    expect(tree.root.keys).toEqual([9])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10, 11])

    tree.insertKey(15)
    expect(tree.root.keys).toEqual([9, 11])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10])
    expect(tree.root.children[2].keys).toEqual([15])

    tree.insertKey(20)
    expect(tree.root.keys).toEqual([9, 11])
    expect(tree.root.children[0].keys).toEqual([8])
    expect(tree.root.children[1].keys).toEqual([10])
    expect(tree.root.children[2].keys).toEqual([15, 20])

    tree.insertKey(17)
    expect(tree.root.keys).toEqual([11])
    expect(tree.root.children[0].keys).toEqual([9])
    expect(tree.root.children[0].children[0].keys).toEqual([8])
    expect(tree.root.children[0].children[1].keys).toEqual([10])
    expect(tree.root.children[1].keys).toEqual([17])
    expect(tree.root.children[1].children[0].keys).toEqual([15])
    expect(tree.root.children[1].children[1].keys).toEqual([20])
  })
})
