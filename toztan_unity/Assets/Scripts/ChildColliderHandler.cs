using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChildColliderHandler : MonoBehaviour {

    [SerializeField]
    private BlockController _parentController;

    void OnCollisionEnter2D(Collision2D other)
    {
        _parentController.OnCollisionEnter2DChild(other);
    }
}
