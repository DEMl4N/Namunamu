// Made by 김뀨뀨
//import { toDoList } from "./list.js"

debugger;

const toDoList =
[
    "핵심취업",
    "웹서비스"
]

const cuk_URI = "https://e-cyber.catholic.ac.kr/ilos/main/main_form.acl"
const course_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/submain_form.acl"
const online_lecture_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/online_list_form.acl"
const online__view_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/online_view_form.acl"

function time_to_seconds(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return (hours * 60 * 60) + (minutes * 60) + seconds;
}

function cuk_main() {
    console.log(`${cuk_URI} connected`);

    var lectures = Array.from(document.getElementsByClassName("sub_open"))

    lectures.filter(element => {
        for (const lectureName of toDoList){
            if (element.innerHTML.includes(lectureName)){
                console.log(element.innerHTML)
                return true
            }
        }
        return false
    })
}

function course() {
    window.location.href = online_lecture_URI
}

function online_lecture() {
    let weekly_lectures = document.getElementsByClassName("ibox3 wb wb-on ")
    for (weekly_lecture_element of weekly_lectures) {

        // complete weekly lectures
        if (weekly_lecture_element.innerHTML.includes("1/1")) {
            continue
        }

        let lectures_list = null

        const observer_lectures_list = new MutationObserver(() => {
            lectures_list = document.getElementsByClassName("lecture-box")
            console.log(lectures_list)
            take_every_lectures(weekly_lecture_element, lectures_list)
        })
        
        observer_lectures_list.observe(document, {childList: true, subtree: true})
        
        weekly_lecture_element.click()
    }
}

function take_every_lectures(weekly_lecture_element, lectures_list) {

    for (lecturebox of lectures_list){
        const view_buttons = lecturebox.getElementsByClassName("site-mouseover-color")
        var idx = 0

        console.log(`This is it. ${view_button}`)

        for (var view_button of view_buttons) {
            const remained_seconds = calcutate_remained_seconds(idx, lecturebox)
            idx++

            if (!remained_seconds){
                continue
            }

            view_button.click()

            chrome.runtime.sendMessage({remained_seconds: remained_seconds}, (response) => {
                console.log(response.message)
            })
        }
    }

}

function calcutate_remained_seconds(idx, lectureElement) {
    const lecture_html = lecture.innerHTML
    let remained_second = 0
    const regex_time = /(\d+):(\d{2}):(\d{2})|(\d{1,2}):(\d{2})(?!\d)/g     // "HH:MM:SS or MM:SS"
    const time_format_iterator = lecture_html.matchAll(regex_time)

    for (var i = 0; i < 2; i++){
        time_format_iterator.next()
    }

    // skip to present lecture time
    for (var i = 0; i <= idx; i++) {
        time_format_iterator.next()
        time_format_iterator.next()
    }

    const time_took = time_format_iterator.next()
    const time_remained = time_format_iterator.next()

    if (time_took.done == true || time_remained.done == true){
        console.log("What")
        return 0
    }

    remained_second = time_to_seconds(time_remained) - time_to_seconds(time_took)

    console.log(`remained: ${remained_second}`)

    return (remained_second > 0)? remained_second : 0
}

if (window.location.href == cuk_URI) {
    if (confirm("나무나무를 시작하시겠습니까?")){
        localStorage.setItem('isExtensionOn', JSON.stringify(true))
    }
    else {
        localStorage.setItem('isExtensionOn', JSON.stringify(false))
    }

    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true){
        cuk_main()
        easterEgg()
    }
}

if (window.location.href == course_URI) {
    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true){
        course()
    }
}

if (window.location.href == online_lecture_URI) {
    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true){
        online_lecture()
    }
}

if (window.location.href == online__view_URI) {
    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true){
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            if (message === 'course_done') {
                console.log("Done")
                const exit_button = document.getElementById("close_")
                exit_button.click()
            }
        })
    }
}



function easterEgg() {
    const user_name = document.getElementById("user").innerHTML
    document.getElementById("user").innerHTML = "나무 심는 " + user_name
}