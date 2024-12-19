const todo = {
  items: [], // 작업 목록
  // 작업 등록
  add(title, description, deadline) {
    const seq = Date.now();
    this.items.push({ seq, title, description, deadline, done: false });

    this.render(); // 화면 갱신
  },
  // 작업 삭제
  remove(seq) {
    // seq로 작업 목록 순서 번호(index) 조회
    const index = this.items.findIndex((item) => item.seq === seq);

    // splice로 해당 순서 번호 항목 제거
    this.items.splice(index, 1);

    // 화면 갱신
    this.render();
  },
  // 작업 목록 출력, 갱신
  render() {
    const itemsEl = document.querySelector(".items");
    itemsEl.innerHTML = "";

    for (const { seq, title, description, deadline } of this.items) {
      const li = document.createElement("li");
      li.append(title);
      itemsEl.append(li);
    }
  },
};

window.addEventListener("DOMContentLoaded", function () {
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
});