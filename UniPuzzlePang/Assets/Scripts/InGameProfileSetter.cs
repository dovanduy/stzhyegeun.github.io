using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class InGameProfileSetter : MonoBehaviour
{

    [SerializeField]
    private Text _txtName;
    [SerializeField]
    private Text _txtScore;
    [SerializeField]
    private GameObject _profileContainer;
    [SerializeField]
    private GameObject _winnerCrown;

    public void setPlayerInfo(string inName, int inScore, string inThumbnailURL)
    {
        _txtName.text = inName;
        _txtScore.text = inScore.ToString();
        // set thumbnail
    }
}
