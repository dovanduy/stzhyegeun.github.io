using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameController : MonoBehaviour {

    [SerializeField]
    private BallController _ballPrefab;
    [SerializeField]
    private GuideLine _guideLine;

    private List<BallController> _ballList;

    // ball
    public int countBall = 1;
    public float ballSpeed = 2000f;

    private bool _isLanding = true;
    private bool _isMouseDown = false;


	// Use this for initialization
	void Start () {
        Screen.SetResolution(720, 1280, true);
        Camera.main.orthographicSize = Mathf.CeilToInt(640);

        _ballList = new List<BallController>();
	}


    IEnumerator FireBalls(Vector3 inTargetPosition)
    {
        for (int i = 0; i < countBall; i++)
        {
            BallController currentBall = (i < _ballList.Count ? _ballList[i] : (BallController)Instantiate(_ballPrefab, _guideLine.transform.position, _guideLine.transform.rotation));
            if (i >= _ballList.Count)
            {
                _ballList.Add(currentBall);
            }
            currentBall.Fire(inTargetPosition, ballSpeed);
            yield return new WaitForSeconds(0.1f);
        }
    }

	// Update is called once per frame
	void Update () {
        /*
        if (Input.touchSupported)
        {
            if (Input.touchCount > 0)
            {
                if (Input.GetTouch(0).phase == TouchPhase.Ended)
                {
                    if (_isMouseDown)
                    {
                        _isLanding = false;
                        StartCoroutine(FireBalls(Input.GetTouch(0).position));
                    }
                    _isMouseDown = false;
                }
                else
                {
                    _isMouseDown = true;
                }
            }
            // Draw GuideLine
            if (_isMouseDown)
            {
                _guideLine.DrawGuideLine(Input.GetTouch(0).position);
            }
            else
            {
                _guideLine.ClearGuideLine();
            }
        }
        else
        {*/
            if (Input.GetMouseButtonDown(0))
            {
                _isMouseDown = true;
            }

            if (Input.GetMouseButtonUp(0))
            {
                if (_isMouseDown)
                {
                    _isLanding = false;
                    StartCoroutine(FireBalls(Input.mousePosition));
                }
                _isMouseDown = false;
            }
            // Draw GuideLine
            if (_isMouseDown)
            {
                _guideLine.DrawGuideLine(Input.mousePosition);
            }
            else
            {
                _guideLine.ClearGuideLine();
            }
         
	}

    void OnCollisionEnter2D(Collision2D other)
    {
        BallController ball = other.gameObject.GetComponent<BallController>();
        if (ball && !ball.isStop)
        {
            ball.StopBall();
            if (_isLanding == false)
            {
                _isLanding = true;
                _guideLine.transform.position = ball.transform.position;
            } else
            {
                ball.transform.position = _guideLine.transform.position;
            }
        }
    }
}
