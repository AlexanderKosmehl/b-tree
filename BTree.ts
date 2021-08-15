import { BTreeNode } from './BTreeNode'

/**
 * A class representation of a generic b-tree
 */
export class BTree<Type> {
  /**
   * The root node of the tree
   */
  root: BTreeNode<Type>

  /**
   * The order of the tree which restricts the minimum and maximum number of keys in a node
   */
  order: number

  constructor (order: number) {
    this.root = new BTreeNode<Type>()
    this.order = order
  }

  /**
   * Steps through the tree to calculate its height
   */
  getHeight () {
    let currentNode = this.root
    let depth = 1
    while (currentNode.children[0]) {
      depth += 1
      currentNode = currentNode.children[0]
    }
    return depth
  }

  /**
   * Helper function to check for the presence of a key
   * @param key A key to be searched for
   * @returns Whether the key is in the tree
   */
  contains (key: Type) {
    if (this.findNode(key)) return true
    else return false
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

  /**
   * Removes the target key from the tree (or subtree if given a node)
   * @param target key to be removed
   * @param nodeToCheck the node and its subsequent subtree in which the key is searched for. (default = root, but convenient for smart duplicate removal)
   */
  remove (target: Type, nodeToCheck: BTreeNode<Type> = this.root) {
    // Find the node with the key
    const containingNode = this.findNode(target, nodeToCheck)

    // Return immediately if key does not exist
    if (!containingNode) return

    // Case 1: Key in internal node
    if (!containingNode.isLeaf()) {
      this.removeKeyFromInternalNode(target, containingNode)
      return
    }

    // Case 2: Key in leaf

    // Subcase 1: No Underflow -> Key can simply be removed
    if (containingNode.keys.length > this.order) {
      containingNode.keys = containingNode.keys.filter(key => key !== target)
      return
    }

    // Subcase 2: Underflow after removal -> Steal key

    // Remove key
    containingNode.keys = containingNode.keys.filter(key => key !== target)

    this.handleUnderflow(containingNode)
  }

  /**
   * Removes the key from the node and rebalances the tree
   * @param target key to be removed
   * @param node node containing the key
   */
  removeKeyFromInternalNode (target: Type, node: BTreeNode<Type>) {
    // Remove key
    const keyPosition = node.keys.findIndex(key => key === target)
    node.keys.splice(keyPosition, 1)
    let tempChild = node.children[keyPosition]

    // Traverse to max value
    while (!tempChild.isLeaf()) {
      tempChild = tempChild.children[tempChild.children.length - 1]
    }

    // Take max value from max child and insert it in parent
    const replaceValue = tempChild.keys[tempChild.keys.length - 1]
    node.insertKey(replaceValue)
    this.remove(replaceValue, tempChild)
  }

  /**
   * Recursively fixes underflow issues from the node and its parent chain
   * @param node the underflowing node
   */
  handleUnderflow (node: BTreeNode<Type>) {
    const leftNeighborNode = node.getLeftNeighborNode()
    const rightNeighborNode = node.getRightNeighborNode()

    if (!node.parent) return // TODO Value in Root

    const positionInParent = node.parent.children.findIndex(child => node === child)

    // Check neighbors and parent to steal from
    if (leftNeighborNode && leftNeighborNode.keys.length > this.order) { // Steal from left neighbor
      // Move key from parent into containing node
      node.insertKey(node.parent.keys[positionInParent - 1])

      // Move key from neighbor into parent overwriting the duplicate in the parent
      node.parent.keys[positionInParent - 1] = leftNeighborNode.keys[leftNeighborNode.keys.length - 1]

      // Remove duplicate in the neighbor
      leftNeighborNode.keys.splice(leftNeighborNode.keys.length - 1, 1)
    } else if (rightNeighborNode && rightNeighborNode.keys.length > this.order) { // Steal from right neighbor
      // Move key from parent into containing node
      node.insertKey(node.parent.keys[positionInParent])

      // Move key from neighbor into parent overwriting the duplicate in the parent
      node.parent.keys[positionInParent] = rightNeighborNode.keys[0]

      // Remove duplicate in the neighbor
      rightNeighborNode.keys.splice(0, 1)
    } else if (leftNeighborNode) { // Merge with left neighbor
      // Move key from parent into containing node
      node.insertKey(node.parent.keys[positionInParent - 1])

      // Remove duplicate in parent
      node.parent.keys.splice(positionInParent - 1, 1)

      // Move all remaining keys from node into neighbor to merge
      node.keys.forEach(key => leftNeighborNode.insertKey(key))

      // Remove the node after merging
      node.parent.children.splice(positionInParent, 1)

      // If Parent Node empty now, delete
      if (node.parent.keys.length === 0 && node.parent.parent == null) {
        leftNeighborNode.parent = null
        this.root = leftNeighborNode
      }
    } else if (rightNeighborNode) { // Merge with right neighbor
      // Move key from parent into containing node
      node.insertKey(node.parent.keys[positionInParent])

      // Remove duplicate in parent
      node.parent.keys.splice(positionInParent, 1)

      // Move all remaining keys from node into neighbor to merge
      node.keys.forEach(key => rightNeighborNode.insertKey(key))

      // Remove the node after merging
      node.parent.children.splice(positionInParent, 1)

      // If Parent Node empty now, delete
      if (node.parent.keys.length === 0 && !node.parent.parent) {
        rightNeighborNode.parent = null
        this.root = rightNeighborNode
      }

      // Handle underflow in next parent
      if (node.parent) {
        if (node.parent.keys.length < this.order && node.parent.parent) {
          this.handleUnderflow(node.parent)
        }
      }
    }
  }
}
