using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameController : MonoBehaviour {

    [SerializeField]
    private BallController _ball;
    [SerializeField]
    private GuideLine _guideLine;

    // ball
    public int countBall = 10;

    private bool _isShoot = false;
    private bool _isMouseDown = false;

	// Use this for initialization
	void Start () {
        Screen.SetResolution(720, 1280, true);
        Camera.main.orthographicSize = Mathf.CeilToInt(640);
	}
	
	// Update is called once per frame
	void Update () {

        if (Input.GetMouseButtonDown(0))
        {
            _isMouseDown = true;
        }

        if (Input.GetMouseButtonUp(0))
        {
            if (_isMouseDown)
            {
                // shoot!!
                _isShoot = true;

                _ball.Fire(Input.mousePosition);
                /*
                for (int i = 0; i < countBall; i++)
                {
                    BallController clone = (BallController)Instantiate(_ball, _guideLine.transform.position, _guideLine.transform.rotation);
                    clone.Fire(Input.mousePosition);
                }*/
            }
            _isMouseDown = false;
        }

        // Draw GuideLine
        if (_isMouseDown)
        {
            _guideLine.DrawGuideLine(Input.mousePosition);
        } else
        {
            _guideLine.ClearGuideLine();
        }
	}
}
