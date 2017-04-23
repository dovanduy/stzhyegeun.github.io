using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BlockController : MonoBehaviour {

    [SerializeField]
    private SpriteRenderer _blockView;
    [SerializeField]
    private Sprite[] _blockSprites;
    [SerializeField]
    private Animation _explodeNormalEffect;
    [SerializeField]
    private Animation _explodeFeverEffect;

    public bool isTouchable = true;

		
	
}
