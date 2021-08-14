export class BTreeNode<Type> {
    parent: BTreeNode<Type> | null
    keys: Type[]
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

    getLeftNeighborNode (): BTreeNode<Type> | null {
      // Node has no parents and thus no neighbours
      if (!this.parent) return null

      // Return the left neighbor if the node is not the leftmost one
      const nodeIndex = this.parent.children.indexOf(this)
      if (nodeIndex === 0) return null
      else return this.parent.children[nodeIndex - 1]
    }

    getRightNeighborNode (): BTreeNode<Type> | null {
      // Node has no parents and thus no neighbours
      if (!this.parent) return null

      // Return the right neighbor if the node is not the rightmost one
      const nodeIndex = this.parent.children.indexOf(this)
      if ((nodeIndex + 1) === this.parent.children.length) return null
      else return this.parent.children[nodeIndex + 1]
    }
}
