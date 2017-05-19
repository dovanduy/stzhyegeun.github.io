using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BallController : MonoBehaviour {

    private Rigidbody2D _rigidbody;

    private bool _isStop = true;
    public bool isStop
    {
        get
        {
            return _isStop;
        }
    }

	void Start()
    {
        _rigidbody = GetComponent<Rigidbody2D>();
    }

    public void Fire(Vector3 inTargetPosition, float inSpeed = 1000f)
    {
        if (_rigidbody == null)
        {
            _rigidbody = GetComponent<Rigidbody2D>();
        }

        Vector3 targetWorldPosition = Camera.main.ScreenToWorldPoint(inTargetPosition);
        Vector3 direction = (targetWorldPosition - gameObject.transform.position).normalized;
        //_rigidbody.velocity = new Vector2(0, 0);
        _rigidbody.velocity = direction * inSpeed;
        _isStop = false;
    }

    public void StopBall()
    {
        _rigidbody.velocity = new Vector2(0, 0);
        _isStop = true;
    }
}
