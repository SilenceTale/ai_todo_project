const todo = {
  tpl: null,
  items: [], // 작업 목록
  itemsSearched: null, // 검색된 작업 목록

  // 초기에 실행할 영역
  init() {
    // 템플릿 HTML 추출
    this.tpl = document.getElementById("tpl").innerHTML;

    // 저장된 작업 목록 조회 및 출력
    const data = localStorage.getItem("todos");
    if (data) {
      // if (data) 만약 데이타가 있다면면
      this.items = JSON.parse(data); // JSON파일의 데이터를 조회하겠다.
    }

    this.render();
  },
  // 작업 등록
  add(title, description, deadline) {
    const seq = Date.now();
    this.items.push({ seq, title, description, deadline, done: false });

    this.save(); // 추가된 작업 저장

    this.render(); // 화면 갱신
  },
  // 작업 삭제
  remove(seq) {
    // seq로 작업 목록 순서 번호(index) 조회
    const index = this.items.findIndex((item) => item.seq === seq);

    // splice로 해당 순서 번호 항목 제거
    this.items.splice(index, 1);

    this.save(); // 작업 목록 저장장

    // 화면 갱신
    this.render();
  },
  // 작업 목록 출력, 갱신
  render() {
    const itemsEl = document.querySelector(".items");
    itemsEl.innerHTML = "";

    const domParser = new DOMParser();

    const items = this.itemsSearched ? this.itemsSearched : this.items;

    for (const { seq, title, description, deadline, done } of items) {
      let html = this.tpl;
      const checkedTrue = done ? " checked" : "";
      const checkedFalse = done ? "" : " checked";

      html = html
        .replace(/#{seq}/g, seq)
        .replace(/#{title}/g, title)
        .replace(/#{description}/g, description.replace(/\n/g, "<br>"))
        .replace(/#{deadline}/g, deadline)
        .replace(/#{checkedTrue}/g, checkedTrue)
        .replace(/#{checkedFalse}/g, checkedFalse)
        .replace(/#{addClass}/g, done ? " done" : "");

      const dom = domParser.parseFromString(html, "text/html");
      const itemEl = dom.querySelector("li");
      itemsEl.append(itemEl);

      const titWrapEl = itemEl.querySelector(".tit-wrap");
      titWrapEl.addEventListener("click", function () {
        todo.accodianView(this.parentElement);
      });

      // 삭제 처리
      const removeEl = itemEl.querySelector(".remove");
      removeEl.addEventListener("click", function () {
        if (confirm("정말 삭제하시겠습니까?")) {
          todo.remove(seq);
        }
      });

      // 작업 완료(checkedTrue), 작업중(checkedFalse) 처리
      const doneEls = document.getElementsByName(`done_${seq}`);
      const itemIndex = this.items.findIndex((item) => item.seq === seq);
      for (const el of doneEls) {
        el.addEventListener("click", function () {
          const done = this.value === "true";
          todo.items[itemIndex].done = done;
          todo.render();
        });
      }
    }
  },
  accodianView(el) {
    const items = document.querySelectorAll(".items > .item");
    items.forEach((item) => item.classList.remove("on"));

    el.classList.add("on");
  },
  /**
   * items(할일 목록)를 localStorage로 저장
   */
  save() {
    const data = JSON.stringify(this.items);
    localStorage.setItem("todos", data);
    this.itemsSearched = null;
    frmSearch.skey.value = "";
  },
  // 정렬
  sort(field, order) {
    // sort 메서드 추가
    this.items.sort((item1, item2) => {
      switch (field) { //switch&case문 사용
        case "deadline":
          let gap = new Date(item2.deadline) - new Date(item1.deadline);
          return order === "desc" ? gap : -gap;
        default:
          return order == "desc"
            ? item2.seq - item1.seq
            : item1.seq - item2.seq;
      }
    });

    this.render();
  },
};

window.addEventListener("DOMContentLoaded", function () {
  // 초기화
  todo.init();

  // 양식 태그의 기본 동작 차단
  frmTodo.addEventListener("submit", function (e) {
    e.preventDefault();

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
          el.classList.add("dn");
        }
      }

      const formData = {};

      // 1. 유효성 검사 S
      const requiredFields = {
        title: "작업 제목을 입력하세요.",
        deadline: "마감일을 입력하세요.",
        description: "작업 내용을 입력하세요.",
      };

      for (const [field, message] of Object.entries(requiredFields)) {
        const value = frmTodo[field].value.trim();
        if (!value) {
          throw new Error(JSON.stringify({ field, message }));
        }

        // 마감일인 경우 현재 날짜보다 이전은 될 수 없음
        if (field === "deadline" && new Date(value) - new Date() < 0) {
          throw new Error(
            JSON.stringify({ field, message: "현재 날짜 이후로 입력하세요." })
          );
        }

        // 입력 데이터 추가
        formData[field] = value;
      }

      // 1. 유효성 검사 E

      // 2. 작업 등록
      const { title, deadline, description } = formData;
      todo.add(title, description, deadline);

      // 3. 양식 초기화
      frmTodo.title.value = "";
      frmTodo.deadline.value = "";
      frmTodo.description.value = "";

      frmTodo.title.focus();
    } catch (err) {
      const { field, message } = JSON.parse(err.message);
      const el = document.getElementById(`error-${field}`);

      if (el) {
        el.innerText = message;
        el.classList.remove("dn");
        el.focus();
      }
    }
  });

  // 작업 목록 정렬 처리 S
  frmSearch.sort.addEventListener("change", function () {
    const [field, order] = this.value.split("_");
    todo.sort(field, order);
  });
  // 작업 목록 정렬 처리 E

  // 키워드 검색 처리 S
  frmSearch.skey.addEventListener("change", function () {
    const skey = this.value.trim();
    todo.itemsSearched = skey
      ? todo.items.filter(
          ({ title, description }) =>
            title.includes(skey) || description.includes(skey)
        )
      : null;

    todo.render();
  });
  // 키워드 검색 처리 E
});
