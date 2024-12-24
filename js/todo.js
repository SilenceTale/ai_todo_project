const todo = {
  tpl: null, // 템플릿 HTML을 저장할 변수 // tpl은 작업 항목을 표시할 HTML 템플릿을 담고 있습니다.
  items: [], // 작업 목록 // items는 작업 목록을 저장하는 배열입니다.
  itemsSearched: null, // 검색된 작업 목록 // itemsSearched는 검색된 작업 목록을 저장합니다.

  // 초기에 실행할 영역
  init() {
    // 템플릿 HTML 추출
    this.tpl = document.getElementById("tpl").innerHTML; // 템플릿을 HTML에서 가져와 tpl 변수에 저장

    // 저장된 작업 목록 조회 및 출력
    const data = localStorage.getItem("todos"); // 로컬 스토리지에서 "todos" 데이터를 가져옴
    if (data) {
      // 만약 데이터가 있다면
      this.items = JSON.parse(data); // JSON 데이터를 JavaScript 객체로 변환하여 items에 저장
    }

    this.render(); // 작업 목록을 화면에 출력
  },

  // 작업 등록
  add(title, description, deadline) {
    const seq = Date.now(); // 현재 시간을 고유한 ID로 사용 // seq는 고유한 작업 식별자를 위해 현재 시간을 사용합니다.
    this.items.push({ seq, title, description, deadline, done: false }); // 새 작업을 목록에 추가

    this.save(); // 작업 목록을 로컬 스토리지에 저장

    this.render(); // 화면을 갱신하여 새 작업을 표시
  },

  // 작업 삭제
  remove(seq) {
    // seq로 작업 목록에서 해당 작업의 인덱스를 찾음
    const index = this.items.findIndex((item) => item.seq === seq);

    // splice로 해당 작업 항목을 제거
    this.items.splice(index, 1);

    this.save(); // 삭제된 작업을 반영하여 로컬 스토리지에 저장

    this.render(); // 화면을 갱신하여 삭제된 작업을 제거
  },

  // 작업 목록 출력, 갱신
  render() {
    const itemsEl = document.querySelector(".items"); // 작업 목록을 표시할 DOM 요소
    itemsEl.innerHTML = ""; // 목록을 비움

    const domParser = new DOMParser(); // HTML 문자열을 DOM 객체로 변환할 DOMParser 객체

    const items = this.itemsSearched ? this.itemsSearched : this.items; // 검색된 목록이 있으면 그것을 사용, 없으면 전체 목록 사용

    // 작업 목록을 하나씩 출력
    for (const { seq, title, description, deadline, done } of items) {
      let html = this.tpl; // 템플릿을 사용하여 작업 항목을 생성
      const checkedTrue = done ? " checked" : ""; // 작업이 완료되었으면 체크 표시
      const checkedFalse = done ? "" : " checked"; // 작업이 완료되지 않았으면 체크 표시

      // 템플릿에서 동적으로 값 교체
      html = html
        .replace(/#{seq}/g, seq) // seq 값을 교체
        .replace(/#{title}/g, title) // title 값을 교체
        .replace(/#{description}/g, description.replace(/\n/g, "<br>")) // description의 개행 문자를 <br>로 변환
        .replace(/#{deadline}/g, deadline) // deadline 값을 교체
        .replace(/#{checkedTrue}/g, checkedTrue) // 완료된 경우 checkedTrue 값을 교체
        .replace(/#{checkedFalse}/g, checkedFalse) // 완료되지 않은 경우 checkedFalse 값을 교체
        .replace(/#{addClass}/g, done ? " done" : ""); // done 클래스 추가 여부 결정

      const dom = domParser.parseFromString(html, "text/html"); // HTML 문자열을 DOM으로 변환
      const itemEl = dom.querySelector("li"); // 변환된 DOM에서 <li> 요소를 추출
      itemsEl.append(itemEl); // 작업 항목을 화면에 추가

      const titWrapEl = itemEl.querySelector(".tit-wrap"); // 제목 부분을 클릭했을 때의 이벤트 처리
      titWrapEl.addEventListener("click", function () {
        todo.accodianView(this.parentElement); // accordion 뷰 방식으로 해당 항목만 표시
      });

      // 삭제 처리
      const removeEl = itemEl.querySelector(".remove"); // 삭제 버튼을 클릭했을 때 처리
      removeEl.addEventListener("click", function () {
        if (confirm("정말 삭제하시겠습니까?")) {
          // 삭제 확인
          todo.remove(seq); // 삭제 실행
        }
      });

      // 작업 완료(checkedTrue), 작업중(checkedFalse) 처리
      const doneEls = document.getElementsByName(`done_${seq}`); // 해당 작업의 완료 상태 라디오 버튼을 가져옴
      const itemIndex = this.items.findIndex((item) => item.seq === seq); // 해당 작업의 인덱스를 찾음
      for (const el of doneEls) {
        el.addEventListener("click", function () {
          const done = this.value === "true"; // 체크된 상태에 따라 완료 여부 설정
          todo.items[itemIndex].done = done; // 완료 상태 업데이트
          todo.render(); // 화면 갱신
        });
      }
    }
  },

  // 아코디언 방식으로 항목을 펼치거나 닫음
  accodianView(el) {
    const items = document.querySelectorAll(".items > .item"); // 모든 항목을 가져옴
    items.forEach((item) => item.classList.remove("on")); // 모든 항목에서 "on" 클래스 제거

    el.classList.add("on"); // 클릭한 항목에 "on" 클래스 추가하여 펼침
  },

  /**
   * items(할일 목록)를 localStorage로 저장
   */
  save() {
    const data = JSON.stringify(this.items); // items 배열을 JSON 문자열로 변환
    localStorage.setItem("todos", data); // 로컬 스토리지에 저장
    this.itemsSearched = null; // 검색된 목록 초기화
    frmSearch.skey.value = ""; // 검색어 초기화
  },

  // 정렬
  sort(field, order) {
    // field(정렬 기준), order(오름차순/내림차순)에 따라 정렬
    this.items.sort((item1, item2) => {
      switch (
        field // 필드별로 정렬 방법을 처리
      ) {
        case "deadline":
          let gap = new Date(item2.deadline) - new Date(item1.deadline); // 날짜를 비교하여 차이 계산
          return order === "desc" ? gap : -gap; // 내림차순/오름차순 처리
        default:
          return order == "desc"
            ? item2.seq - item1.seq // seq 값 기준 내림차순
            : item1.seq - item2.seq; // seq 값 기준 오름차순
      }
    });

    this.render(); // 정렬 후 화면 갱신
  },
};

window.addEventListener("DOMContentLoaded", function () {
  // 초기화
  todo.init(); // todo 객체의 init 메서드 호출

  // 양식 태그의 기본 동작 차단
  frmTodo.addEventListener("submit", function (e) {
    e.preventDefault(); // 폼 제출 시 기본 동작을 막고 아래 처리 진행

    /**
     * 0. 검증 실패 메세지 출력화면 초기화
     * 1. 필수 항목 검증
     * 2. 일정 추가
     * 3. 양식 초기화
     */
    try {
      // 0. 검증 실패 메세지 출력화면 초기화
      const errors = document.getElementsByClassName("error");
      for (const el of errors) {
        el.innerText = "";
        if (!el.classList.contains("dn")) {
          el.classList.add("dn"); // 오류 메시지 숨김 처리
        }
      }

      const formData = {}; // 폼 데이터를 저장할 객체

      // 1. 유효성 검사
      const requiredFields = {
        title: "작업 제목을 입력하세요.",
        deadline: "마감일을 입력하세요.",
        description: "작업 내용을 입력하세요.",
      };

      for (const [field, message] of Object.entries(requiredFields)) {
        const value = frmTodo[field].value.trim(); // 각 필드 값 공백 제거
        if (!value) {
          throw new Error(JSON.stringify({ field, message })); // 필수 항목이 비어 있으면 에러 발생
        }

        // 마감일인 경우 현재 날짜보다 이전은 될 수 없음
        if (field === "deadline" && new Date(value) - new Date() < 0) {
          throw new Error(
            JSON.stringify({ field, message: "현재 날짜 이후로 입력하세요." })
          ); // 마감일이 현재 날짜 이전이면 에러 발생
        }

        // 입력 데이터 추가
        formData[field] = value;
      }

      // 1. 유효성 검사 E

      // 2. 작업 등록
      const { title, deadline, description } = formData;
      todo.add(title, description, deadline); // 새 작업을 추가

      // 3. 양식 초기화
      frmTodo.title.value = "";
      frmTodo.deadline.value = "";
      frmTodo.description.value = "";

      frmTodo.title.focus(); // 제목 필드에 포커스
    } catch (err) {
      const { field, message } = JSON.parse(err.message); // 에러 메시지 처리
      const el = document.getElementById(`error-${field}`);

      if (el) {
        el.innerText = message; // 오류 메시지 표시
        el.classList.remove("dn"); // 오류 메시지 표시
        el.focus(); // 오류 메시지가 있는 필드에 포커스
      }
    }
  });

  // 작업 목록 정렬 처리 S
  frmSearch.sort.addEventListener("change", function () {
    const [field, order] = this.value.split("_"); // 정렬 기준과 순서를 추출
    todo.sort(field, order); // 정렬 실행
  });
  // 작업 목록 정렬 처리 E

  // 키워드 검색 처리 S
  frmSearch.skey.addEventListener("change", function () {
    const skey = this.value.trim(); // 검색어 추출
    todo.itemsSearched = skey
      ? todo.items.filter(
          ({ title, description }) =>
            title.includes(skey) || description.includes(skey)
        ) // 제목이나 설명에 검색어가 포함된 항목만 필터링
      : null;

    todo.render(); // 검색 후 화면 갱신
  });
  // 키워드 검색 처리 E
});
