using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public enum EBlockType
{
    RECTANGLE = 0, 
    TRIANGLE_LEFT_BOTTOM = 1, 
    TRIANGLE_RIGHT_BOTTOM = 2, 
    TRIANGLE_RIGHT_TOP = 3, 
    TRIANGLE_LEFT_TOP = 4, 
    CIRCLE = 5
}

public class BlockController : MonoBehaviour {

    [SerializeField]
    private Collider2D[] _colliderList;
    [SerializeField]
    private Text _txtCount;
    [SerializeField]
    private LineRenderer _line;

    public EBlockType type = EBlockType.RECTANGLE;
    public int count = 1;
    private PolygonCollider2D _currentCollider;


	// Use this for initialization
	void Start () {
        foreach(Collider2D col in _colliderList)
        {
            col.gameObject.SetActive(false);
        }

        _currentCollider = (PolygonCollider2D)_colliderList[(int)type];
        _currentCollider.gameObject.SetActive(true);

    
        _line.positionCount = _currentCollider.points.Length + 1;
        for (int i = 0; i < _currentCollider.points.Length; i++)
        {
            _line.SetPosition(i, _currentCollider.points[i]);

            if (i + 1 == _currentCollider.points.Length)
            {
                _line.SetPosition(i + 1, _currentCollider.points[0]);
            }
        }

        _txtCount.text = count.ToString();
        
    }


    public void OnCollisionEnter2DChild(Collision2D other)
    {
        BallController ball = other.gameObject.GetComponent<BallController>();
        if (ball)
        {
            count--;
            _txtCount.text = count.ToString();

            if (count <= 0)
            {
                Destroy(gameObject);
            }
        }
    }
}
