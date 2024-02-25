import './App.css';
import Falando from "../src/images/falando.png"
import AiFalando from "../src/images/robo-falando.webp"
import SendMessage from "./images/sendmessage.png"

import OpenAI from 'openai';
import { useEffect } from 'react';

function App() {
  const c = (cl: any) => document.querySelector(cl)

  let maxWords:any = []

  let timeOutBot: any = []
  let checkIfSpoke:any = []

  const openai = new OpenAI({ apiKey: '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', dangerouslyAllowBrowser: true })

  //Escolher entre conversar por texto e conversar por voz
  const closeMainModal = (e:any) => {
    console.log( e.target.className )

    if( e.target.className === 'section-talk-to-text-modal' ) {
      c('.App .main-modal').style.display = 'none'
      c('.App .talk-to-text').style.display = 'flex'
      c('.App').style.backgroundColor = 'rgb(59, 59, 59)'
    } else {
      c('.App .main-modal').style.display = 'none'
      c('.App .talk-to-voice').style.display = 'flex'
    }
  }


  //Parte da conversa por texto
  const sendMessageButton = () => {
    if( c('.App .talk-to-text .section-chat-user input').value !== '' ) {
      let newDiv = document.createElement('div')
      newDiv.setAttribute('class', 'add-talk')
      newDiv.style.marginBottom = '10px'
      newDiv.innerHTML = c('.App .talk-to-text .section-chat-user input').value
      c('.App .talk-to-text .section-chat').appendChild(newDiv)

      c('.App .talk-to-text .section-chat').scrollTop = c('.App .talk-to-text .section-chat').scrollHeight;

      botAnswer( c('.App .talk-to-text .section-chat-user input').value )

      c('.App .talk-to-text .section-chat-user input').value = ''
    }
  }

  document.addEventListener('keyup', function(e:any) {
    console.log( e.key )
    if( e.key === 'Enter' && c('.App .talk-to-text .section-chat-user input').value !== '' ) {
      sendMessageButton()
    }
  })

  const botAnswer = async (e:string) => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: `${e}` }],
      model: "gpt-3.5-turbo",
    });

    console.log( completion.choices[0].message.content )

    let newDiv = document.createElement('div')
    newDiv.setAttribute('class', 'add-talk-bot')
    newDiv.style.marginBottom = '10px'
    newDiv.innerHTML = `${completion.choices[0].message.content}`
    c('.App .talk-to-text .section-chat').appendChild(newDiv)

    c('.App .talk-to-text .section-chat').scrollTop = c('.App .talk-to-text .section-chat').scrollHeight;

    c('.App .talk-to-text .section-chat-user input').focus()
  }

  const backToHome = () => {
    c('.App .main-modal').style.display = 'flex'
    c('.App .talk-to-text').style.display = 'none'
    c('.App .talk-to-voice').style.display = 'none'
    c('.App').style.backgroundColor = 'white'
  }


  //Parte da conversa por voz
  let openedModal = true
  let voicechoice:any = []
  let idiomChoice = ''
  let messageEmpt = ''

  /*let languages = {
    portuguese: {
      voicechoice: [],
      idiomChoice: [],
      messageEmpt: [],
      maxWords: []
    }
  }*/

  //PARA BOT FALAR
  let synth = window.speechSynthesis

  synth.cancel()

  const SpeechUser = () => {
    if( openedModal === false ) {
      c('.app-container img').style.display = 'none'
      c('.app-container .user-talking').style.display = 'block'

      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new window.SpeechRecognition();
      //recognition.interimResults = true

      recognition.lang = idiomChoice

      let saveUserSpeak = false
      let saveUserSpeak2 = ''
      recognition.addEventListener('result', (e:any) => {
        //console.log( e.results[0][0].transcript )

        if( e.results[0][0].transcript !== saveUserSpeak2) {
          c('.app-container .user-talking').style.width = '28vw'
          c('.app-container .user-talking').style.height = '28vw'
        } else {
          c('.app-container .user-talking').style.width = '25vw'
          c('.app-container .user-talking').style.height = '25vw'
        }

        saveUserSpeak2 = e.results[0][0].transcript

        if( e.results[0].isFinal === true && openedModal === false ) {
          let url = require('../src/audios/speak-finish.mp3')
          let audio = new Audio(url)
          audio.play();

          saveUserSpeak = true
          main( e.results[0][0].transcript )
        }
      })

      timeOutBot = setTimeout(() => {
        if(saveUserSpeak === false && openedModal === false) {
          let url = require('../src/audios/speak-finish.mp3')
          let audio = new Audio(url)
          audio.play();

          console.log('dsfgdg')
          main( messageEmpt )

        }
      }, 8000)

      recognition.start()
    }
  }

  
  async function main(e:any) {

    e !== messageEmpt ? maxWords = maxWords : maxWords = ''

    if( openedModal === false ) {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: `${e} ${maxWords}` }],
        model: "gpt-3.5-turbo",
      });

      //console.log( completion.choices[0].message.content )
  
      c('.app-container .user-talking').style.display = 'none'
      c('.app-container img').style.display = 'block'
      c('.app-container .user-talking').style.width = '25vw'
      c('.app-container .user-talking').style.height = '25vw'
      //c('.app-container img').src = AiFalando
  
      let toSpeak: any = new SpeechSynthesisUtterance( `${completion.choices[0].message.content}`)
      //console.log( synth.getVoices() )

      toSpeak.voice = synth.getVoices()[voicechoice]

      synth.speak( toSpeak )

      let r = setInterval(() => {
        if( !synth.speaking ) {
          clearInterval(r)
        } else {
          synth.pause()
          synth.resume()
        }
      }, 14000)
  
      checkIfSpoke = setInterval((): any => {
        if( synth.speaking !== true && openedModal === false ) {
          //console.log('fdgfdfg')
          let url = require('../src/audios/speak-finish.mp3')
          let audio = new Audio(url)
          audio.play();
          SpeechUser()
          clearInterval( checkIfSpoke )
        }
      },1000) 
    }
  }

  let checkboxChecked = false
  const closeModal = () => {
    if( checkboxChecked === true ) {
      openedModal = false
      c('.modal-app').style.display = 'none'
      if( c('#checkPortuguês').checked) {
        voicechoice = 0
        idiomChoice = 'pt-BR'
        messageEmpt = 'Desculpe, eu não entendi o que você disse'
  
        messageEmpt !== '' ? maxWords = 'com no máximo 50 palavras' : maxWords = ''
  
        maxWords = 'com no máximo 50 palavras'
        SpeechUser()
      } else if( c('#checkInglês').checked) {
        voicechoice = 3
        idiomChoice = 'en-US'
        messageEmpt = 'Sorry, I did not understand what you said'
        maxWords = 'with up to 50 words'
        SpeechUser()
      } else if( c('#checkFrancês').checked) {
        voicechoice = 8
        idiomChoice = 'fr-FR'
        messageEmpt = "Désolé, je n'ai pas compris ce que tu as dit"
        maxWords = 'avec un maximum de 50 mots'
        SpeechUser()
      } else if( c('#checkJaponês').checked) {
        voicechoice = 12
        idiomChoice = 'ja-JP'
        messageEmpt = "申し訳ありませんが、何と言っているのか理解できませんでした"
        maxWords = '最大50単語まで'
        SpeechUser()
      } 
  
      let saveOptions = document.querySelectorAll('.modal-app-options div')//[0].childNodes[0]
      saveOptions.forEach(div => {
        let inputElement = div.querySelector('input')
        if( inputElement?.checked ) {
          inputElement.checked = false
        }
      });

      checkboxChecked = false
      c('.modal-app-title').removeAttribute('title', 'Primeiro selecione o idioma')
    } else {
      c('.modal-app-title').setAttribute('title', 'Primeiro selecione o idioma')
    }
  }

  const openModal = () => {
    
      clearTimeout( timeOutBot )
      clearInterval( checkIfSpoke )
      openedModal = true
      synth.cancel()
      c('.modal-app').style.display = 'flex'
      c('.modal-app-title').setAttribute('title', 'Primeiro selecione o idioma')
  }
  //final de bot falar

  useEffect(() => {
    let checkboxs = document.querySelectorAll('.modal-app-options div input[type="checkbox"]')//[0].childNodes[0]
    checkboxs.forEach(checkbox => {
      checkbox.addEventListener('change', function(this: HTMLInputElement) {
        if( this.checked ) {
          checkboxs.forEach(otherCheckbox => {
            if( otherCheckbox !== this ) {
              (otherCheckbox as HTMLInputElement).checked = false
              checkboxChecked = true
              c('.modal-app-title').removeAttribute('title', 'Primeiro selecione o idioma')
            }
          })
        }
      })
    });
  }, [])

  return (
    <div className="App">
      <div className='main-modal' onClick={closeMainModal}>
        <div className='section-talk-to-text-modal'>
          CONVERSAR POR TEXTO
        </div>
        <div className='section-talk-to-voice-modal'>
          CONVERSAR POR VOZ
        </div>
      </div>

      <div className='talk-to-text'>
        <div className='back-to-home' onClick={backToHome}>&#10142;</div>
        <div className='section-chat'>

        </div>
        <div className='section-chat-user'>
          <input type="text" />
          <div>
            <img src={SendMessage} onClick={sendMessageButton}/>
          </div>
          
        </div>
      </div>
      <div className='talk-to-voice'>
          <div className='modal-app'>
            <div className='back-to-home' onClick={backToHome}>&#10142;</div>
            <div className='modal-app-title' onClick={closeModal}>Iniciar Conversa com BOT</div>
            <div className='modal-app-options'>
              <div>
                <input id='checkPortuguês' type="checkbox" name='idiom'/>
                <label htmlFor="checkPortuguês">Português</label>
              </div>
              <div>
                <input id="checkInglês" type="checkbox" name='idiom'/>
                <label htmlFor="checkInglês">Inglês</label>
              </div>
              <div>
                <input id='checkFrancês' type="checkbox" name='idiom'/>
                <label htmlFor="checkFrancês">Francês</label>
              </div>
              <div>
                <input id='checkJaponês' type="checkbox" name='idiom'/>
                <label htmlFor="checkJaponês">Japonês</label>
              </div>
            </div>
          </div>
          <div className='app-container'>
            <div className='open-modal' onClick={openModal}>X</div>
            <div className='user-talking'></div>
            <img src={AiFalando} style={{display: 'none'}}/>
          </div>
      </div>
    </div>
  );
}

export default App;
