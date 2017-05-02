using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimCloudChargedController : MonoBehaviour {

    private Animator _anim;

	// Use this for initialization
	void Start () {
        _anim = GetComponent<Animator>();
        _anim.SetTrigger("cloudIdle");
	}
	
	public void onAnimCompleted()
    {
        _anim.SetTrigger("cloudIdle");
    }

    public void playCloudCharged()
    {
        _anim.SetTrigger("cloudCharged");
    }
}
