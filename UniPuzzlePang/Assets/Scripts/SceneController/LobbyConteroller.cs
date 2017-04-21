using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class LobbyConteroller : MonoBehaviour {

    [SerializeField]
    private GameObject[] waitingDots;
    [SerializeField]
    private ProfileSetter _meProfile;
    [SerializeField]
    private ProfileSetter _rivalProfile;

	// Use this for initialization
	void Start () {
        _meProfile.setPlayerInfo("나야나!", 1, "썸네일");
        StartCoroutine(StartWaitingCount(15));
	}
	
    // 카운트 다운 로직
    private int _curWaitingCount = 15;
    public IEnumerator StartWaitingCount(int inTotalCount)
    {
        _curWaitingCount = inTotalCount;

        while(_curWaitingCount > 0)
        {
            yield return new WaitForSeconds(1.0f);
            _curWaitingCount--;
            showWaitingDotsNext();
        }

        if (_curWaitingCount <= 0)
        {
            Debug.Log("Change Scene to InGame");
            _rivalProfile.setPlayerInfo("라이벌!", 99, "썸네일");
            //SceneManager.LoadScene("InGame");
        }
    } 

    private void showWaitingDotsNext()
    {
        int lastVisibleIndex = -1;
        for (int i = waitingDots.Length - 1; i >= 0; i-- )
        {
            if (waitingDots[i].activeSelf)
            {
                lastVisibleIndex = i;
                break;
            }
        }

        if (lastVisibleIndex < 0)
        {
            waitingDots[0].SetActive(true);
        }
        else if (lastVisibleIndex == (waitingDots.Length - 1))
        {
            for (int i = waitingDots.Length - 1; i >= 0; i--)
            {
                waitingDots[i].SetActive(false);
            }
        }
        else
        {
            waitingDots[lastVisibleIndex + 1].SetActive(true);
        }
    }
}
