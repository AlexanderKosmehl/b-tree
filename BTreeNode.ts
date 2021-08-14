export class BTreeNode<Type> {
    parent: BTreeNode<Type> | null
    keys: Type[]
    children: BTreeNode<Type>[]

    constructor (parent: BTreeNode<Type> | null = null, keys: Type[] = [], children: BTreeNode<Type>[] = []) {
      this.parent = parent
      this.keys = keys
      this.children = children
    }

    isLeaf (): boolean {
      return this.children.length === 0
    }

    insertKey (newKey: Type) {
      // Attempts to find a suitable position for the element
      let insertIndex = this.keys.findIndex(key => newKey < key)

      // If no position in the list is found, insert it at the end instead
      if (insertIndex === -1) insertIndex = this.keys.length

      // Insert the value at the suitable position
      this.keys.splice(insertIndex, 0, newKey)
    }

    isFull (order: number) {
      return this.keys.length >= 2 * order
    }

    addChild (newChild: BTreeNode<Type>) {
      newChild.parent = this
      const firstKey = newChild.keys[0]

      // TODO: Improve this
      for (let i = 0; i < this.keys.length; i++) {
        if (firstKey < this.keys[i]) {
          this.children.splice(i, 0, newChild)
          break
        } else if (firstKey > this.keys[i] && !this.keys[i + 1]) {
          this.children.splice(i + 1, 0, newChild)
          break
        }
      }
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
