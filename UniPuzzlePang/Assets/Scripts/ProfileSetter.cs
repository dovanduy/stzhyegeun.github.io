using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ProfileSetter : MonoBehaviour {

    [SerializeField]
    private Text _txtName;
    [SerializeField]
    private Text _txtLevel;
    [SerializeField]
    private GameObject _profileContainer;

    public void setPlayerInfo(string inName, int inLevel, string inThumbnailURL)
    {
        _txtName.text = inName;
        _txtLevel.text = "LV." + inLevel.ToString();
    }

}
