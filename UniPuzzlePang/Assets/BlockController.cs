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
    [SerializeField]
    private EBlockType _blockType;

    public EBlockType blockType
    {
        get
        {
            return _blockType;
        }
    }

    

    public bool isTouchable = true;

		
	
}
