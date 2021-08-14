import { BTreeNode } from './BTreeNode'

export class BTree<Type> {
  root: BTreeNode<Type>
  order: number
  height: number // Remove?

  constructor (order: number) {
    this.root = new BTreeNode<Type>()
    this.order = order
    this.height = 1
  }

  /**
   * Searches the tree recursively for the given value
   * @param value The searched for value
   * @param node The Node to start search with (default = root)
   * @returns The Node containing the value or null
   */
  findNode (value: Type, node: BTreeNode<Type> = this.root): BTreeNode<Type> | null {
    // Node contains no elements
    if (node.keys.length === 0) return null

    // Node contains the target value => return this node
    if (node.keys.some(key => key === value)) return node

    // Has no children to continue search with => end search
    if (node.isLeaf()) return null

    // Continue search with next suitable child
    let nextChildIndex = node.keys.findIndex(key => value < key)
    if (nextChildIndex === -1) nextChildIndex = node.keys.length
    return this.findNode(value, node.children[nextChildIndex])
  }

  /**
   * Inserts a new key into the tree and splits all overfull nodes accordingly
   * @param newKey New key to be inserted into the tree
   */
  insert (newKey: Type): void {
    // Find an appropriate leaf node to insert into
    const leafNode = this.getAppropriateLeafNode(newKey)

    // Insert if the node is not full
    if (!leafNode.isFull(this.order)) {
      leafNode.insertKey(newKey)
      return
    }

    // Node has to be split since it is now overfull
    leafNode.insertKey(newKey)
    this.splitNode(leafNode)
  }

  /**
   * Returns the node in which the key should be inserted
   * @param newKey New key to be inserted
   * @param nodeToCheck current node to be checked
   * @returns The appropriate node
   */
  getAppropriateLeafNode (newKey: Type, nodeToCheck: BTreeNode<Type> = this.root): BTreeNode<Type> {
    // Return the node once a leafnode is reached
    if (nodeToCheck.isLeaf()) return nodeToCheck

    // Find the appropriate next child to check
    let nextChildIndex = nodeToCheck.keys.findIndex(key => newKey < key)
    if (nextChildIndex === -1) nextChildIndex = nodeToCheck.keys.length

    // Traverse down the tree recursively
    return this.getAppropriateLeafNode(newKey, nodeToCheck.children[nextChildIndex])
  }

  /**
   * Splits a node along its median. The median gets transfered up into the parent while the parts to its left and right are the contents of the new child nodes.
   * @param nodeToSplit The node that should be split
   */
  splitNode (nodeToSplit: BTreeNode<Type>) {
    // Get the parent node to insert into or new node if the node to be split is the root
    const parentNode = nodeToSplit.parent ? nodeToSplit.parent : new BTreeNode<Type>()

    // New neighbor which will receive the right half of the keys and children
    const neighborNode = new BTreeNode<Type>()

    const median = nodeToSplit.keys[this.order]

    // Put keys and children after the median into the new neighbor
    neighborNode.keys = nodeToSplit.keys.slice(this.order + 1)
    neighborNode.children = nodeToSplit.children.slice(this.order + 1)
    neighborNode.children.forEach(child => {
      child.parent = neighborNode
    })

    // Keep keys and children before the median in the old node
    nodeToSplit.keys = nodeToSplit.keys.slice(0, this.order)
    nodeToSplit.children = nodeToSplit.children.slice(0, this.order + 1) // Probably?

    // Check whether parent has to be split later on
    const parentNodeIsAlreadyFull = parentNode.isFull(this.order)

    // Move median up into parent and link to new children
    parentNode.insertKey(median)

    // Only add node to parent if the parent was newly generated
    if (!nodeToSplit.parent) parentNode.addChild(nodeToSplit)
    parentNode.addChild(neighborNode)
    if (!parentNode.parent) this.root = parentNode

    // Split parent if necessary
    if (parentNodeIsAlreadyFull) this.splitNode(parentNode)
  }
}
