/**
 * Class representation of a single node in the b-tree
 */
export class BTreeNode<Type> {
  /**
   * The node containing the current instance or null if the node is the root node
   */
  parent: BTreeNode<Type> | null

  /**
   * A list of all keys saved in the node
   */
  keys: Type[]

  /**
   * A list of all child nodes referenced from this node
   */
  children: BTreeNode<Type>[]

  constructor (parent: BTreeNode<Type> | null = null, keys: Type[] = [], children: BTreeNode<Type>[] = []) {
    this.parent = parent
    this.keys = keys
    this.children = children
  }

  /**
   * Simple helper function that returns whether the node is a leaf
   * @returns Whether the node is a leaf
   */
  isLeaf (): boolean {
    return this.children.length === 0
  }

  /**
   * Simple helper function that returns whether the node is full
   * @param order Order of the tree
   * @returns Whether the node is full given the order of the tree
   */
  isFull (order: number) {
    return this.keys.length >= 2 * order
  }

  /**
   * Helper function to insert a key at the appropriate index
   * @param newKey New key to be inserted into keys
   */
  insertKey (newKey: Type) {
    // Attempts to find a suitable position for the element
    let insertIndex = this.keys.findIndex(key => newKey < key)

    // If no position in the list is found, insert it at the end instead
    if (insertIndex === -1) insertIndex = this.keys.length

    // Insert the value at the suitable position
    this.keys.splice(insertIndex, 0, newKey)
  }

  /**
   * Helper function to insert a node at the appropriate index
   * @param newChild New Node to be inserted into children
   */
  addChild (newChild: BTreeNode<Type>) {
    // Sets or overrides childs parent
    newChild.parent = this

    // Find correct location for child and its keys
    const firstKey = newChild.keys[0]
    let insertIndex = this.keys.findIndex(key => firstKey < key)
    if (insertIndex === -1) insertIndex = this.keys.length

    // Insert it at appropriate location
    this.children.splice(insertIndex, 0, newChild)
  }

  /**
   * Helper function to get the left neighbor with proper null handling
   * @returns The neighbor node or null if no neighbor exists
   */
  getLeftNeighborNode (): BTreeNode<Type> | null {
    // Node has no parents and thus no neighbours
    if (!this.parent) return null

    // Return the left neighbor if the node is not the leftmost one
    const nodeIndex = this.parent.children.indexOf(this)
    if (nodeIndex === 0) return null
    else return this.parent.children[nodeIndex - 1]
  }

  /**
   * Helper function to get the right neighbor with proper null handling
   * @returns The neighbor node or null if no neighbor exists
   */
  getRightNeighborNode (): BTreeNode<Type> | null {
    // Node has no parents and thus no neighbours
    if (!this.parent) return null

    // Return the right neighbor if the node is not the rightmost one
    const nodeIndex = this.parent.children.indexOf(this)
    if ((nodeIndex + 1) === this.parent.children.length) return null
    else return this.parent.children[nodeIndex + 1]
  }
}
