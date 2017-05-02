using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class InGameController : MonoBehaviour {

    public const int GAME_WIDTH = 720;
    public const int GAME_HEIGHT = 1280;
    public const int BOARD_LEFT_OFFSET = 30;
    public const int BLOCK_BETWEEN_OFFSET = 25;
    public const int BLOCK_SIZE = 73;
    public const int COL_COUNT = 7;
    public const int ROW_COUNT = 7;


    [SerializeField]
    private BlockController[] _blockPrefabs;
    [SerializeField]
    private GameObject _blockContainer;

    [SerializeField]
    private AnimCloudChargedController animCloudCharge;
    [SerializeField]
    private Animator animIceCharge;
    [SerializeField]
    private Animator animFeverCharge;


    private BlockController[] _blocks;

    public bool isCloudCharged = false;
    public bool isIceCharged = false;
    public bool isFeverCharged = false;
    

    // Use this for initialization
    void Start () {      
        _blocks = new BlockController[COL_COUNT * ROW_COUNT];
        initBoard();	
	}
	
	// Update is called once per frame
	void Update () {
        if (Input.GetKey(KeyCode.Space)) {
            animCloudCharge.playCloudCharged();
        }
	}



    void initBoard()
    {
        for (int i = 0; i < ROW_COUNT; i++)
        {
            for (int j = 0; j < COL_COUNT; j++)
            {
                int randBlockType = Random.Range(0, 6);
                if (randBlockType >= _blockPrefabs.Length)
                {
                    continue;
                }

                int indexValue = getBoardIndexFromCoordinate(j, i);
                _blocks[indexValue] = Instantiate(_blockPrefabs[randBlockType]);
                _blocks[indexValue].transform.parent = _blockContainer.transform;
                _blocks[indexValue].transform.localPosition = getBlockPosition(j, i);
                //_blocks[indexValue].transform.position = getBlockPosition(j, i) + _blockContainer.transform.position;
                _blocks[indexValue].name = string.Format("block_{0}_{1}", j, i);
                
            }
        }
    }

    /// <summary>
    /// 보드에서 
    /// </summary>
    /// <param name="inCol"></param>
    /// <param name="inRow"></param>
    /// <returns></returns>
    public int getBoardIndexFromCoordinate(int inCol, int inRow)
    {
        if (inCol < 0 || inCol >= COL_COUNT)
        {
            return -1;
        }

        if (inRow < 0 || inRow >= ROW_COUNT)
        {
            return -1;
        }

        int result = (int)inRow * COL_COUNT + (int)inCol;
        return result;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="inIndex"></param>
    /// <returns></returns>
    public Vector2? getBoardCoordinateFromIndex(int inIndex)
    {
        if (inIndex < 0 || inIndex >= COL_COUNT * ROW_COUNT)
        {
            return null;
        }

        int coordX = inIndex % COL_COUNT;
        int coordY = inIndex / COL_COUNT;

        Vector2 result = new Vector2(coordX, coordY);
        return result;
    }

    Vector3 getBlockPosition(int inX, int inY)
    {
        float posX = BOARD_LEFT_OFFSET + ((BLOCK_BETWEEN_OFFSET + BLOCK_SIZE) * inX) + (BLOCK_SIZE / 2);
        float posY = ((BLOCK_BETWEEN_OFFSET + +BLOCK_SIZE) * inY) + (BLOCK_SIZE / 2);

        return new Vector3(posX, -1 * posY);
    } 
}


