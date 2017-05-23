using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GuideLine : MonoBehaviour {

    private LineRenderer _line;

	// Use this for initialization
	void Start () {
        _line = GetComponent<LineRenderer>();
	}

    public void DrawGuideLine(Vector3 inEnd)
    {
        Vector2 endPosition = Camera.main.ScreenToWorldPoint(inEnd);
        _line.positionCount = 2;
        _line.SetPosition(0, gameObject.transform.position);
        _line.SetPosition(1, endPosition);
    }

    public void ClearGuideLine()
    {
        _line.positionCount = 0;
    }

    
}
