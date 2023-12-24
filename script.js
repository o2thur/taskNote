$(document).ready(function () {
    const switcher = $(".switcher"),
        taskSection = $("#taskSection"),
        noteSection = $("#noteSection"),
        taskInput = $("#taskInput"),
        addUpdateButton = $(".addUpdateButton"),
        taskList = $("#taskList"),
        noteInput = $("#noteInput"),
        noteList = $("#noteList"),
        specialDiv = $(".specialDiv"),
        seeChecked = $("#seeChecked"),
        seeFavorites = $("#seeFavorites")
    currentDate = new Date();
    let savedTasks = [],
        savedNotes = [],
        notes = null,
        tasks = 1,
        editMode = null,
        toUpdateText = '',
        taskDeadline = $("#taskDeadline"),
        noteCategory = $("#noteCategory");

    switcher.on("click", () => {
        if (noteSection.css("display") === "none") {
            taskSection.css("display", "none")
            noteSection.css("display", "flex")
            notes = 1
            tasks = null
            renderSaved('note')
        } else if (taskSection.css("display") === "none") {
            taskSection.css("display", "flex")
            noteSection.css("display", "none")
            tasks = 1
            notes = null
            renderSaved('task')
        }
    })

    // # # # # # TASK LIST # # # # # //

    // Remove past days from input[date]
    const formattedCurrentDate = currentDate.toISOString().split('T')[0];
    taskDeadline.attr('min', formattedCurrentDate);

    // Get items in localStorage if there is anything stored
    savedTasks = JSON.parse(localStorage.getItem('savedTasks')) || []
    savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || []


    // Function to get the deadline input ('12/03/23 UTC 9:32PM') and calculate how many days are left untill the deadline date
    function calculateDeadline() {
        let taskDeadlineDate = new Date(taskDeadline.val());
        taskDeadlineDate = Math.ceil((taskDeadlineDate - currentDate) / (1000 * 3600 * 24));
        return taskDeadlineDate
    }

    // Clear task and deadline input
    function clearInputFields(switching) {
        if (switching === 'task') {
            taskInput.val("");
            taskDeadline.val("");
        } else {

        }
    }

    // After editing, exit the edit mode
    function exitEditMode() {
        editMode = null;
        addUpdateButton.text("Add");
    }

    function addUpdate(switching) {

        if (switching === 'task') {
            // Add new tasks
            if (editMode === null && taskInput.val() && taskDeadline.val()) {
                let taskDeadlineDate = calculateDeadline()

                // Check if there is already a task with both the name and deadline
                if (!savedTasks.some(task => task.task === taskInput.val() && task.deadline === taskDeadlineDate)) {

                    savedTasks.push({
                        task: taskInput.val(),
                        deadline: taskDeadlineDate,
                        check: 0
                    })

                    renderSaved('task')
                    localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
                    clearInputFields('task')

                } else {
                    alert("You already have this exact task in this exact day")
                };

                // Edit existing task
            } else if (editMode === 1 && taskInput.val()) {
                const updatedText = taskInput.val()
                const updatedDeadline = calculateDeadline()

                // Check if there is already a task with both the name and deadline
                if (!savedTasks.some(task => task.task === updatedText && task.deadline === updatedDeadline)) {
                    savedTasks.forEach(task => {
                        if (toUpdateText === task.task) {
                            task.task = updatedText
                            if (taskDeadline.val()) {
                                task.deadline = updatedDeadline
                            }
                            task.check = 0
                            localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
                            renderSaved('task')
                            clearInputFields('task')
                            exitEditMode()

                        }
                    })
                } else {
                    alert("You already have this exact task in this exact day")
                }

            } else if (!taskInput.val()) {
                alert("Please, type a task first")

            } else if (!taskDeadline.val()) {
                alert("Please, select a deadline first")

            }
        } else if (switching === 'note') {
            // Add new note
            if (editMode === null && noteInput.val() && noteCategory.val()) {

                // Check if there is already a note with both the name and deadline
                if (!savedNotes.some(note => note.note === noteInput.val() && note.category === noteCategory.val())) {
                    savedNotes.push({
                        note: noteInput.val(),
                        category: noteCategory.val(),
                        favorite: 0
                    })

                    renderSaved('note')
                    localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
                    clearInputFields('note')

                } else {
                    alert("You already have this exact note with this exact category")
                };

                // Edit existing task
            } else if (editMode === 1 && noteInput.val()) {
                const updatedText = noteInput.val()
                const updatedCategory = noteCategory.val()

                // Check if there is already a task with both the name and deadline
                if (!savedNotes.some(note => note.note === updatedText && note.category === updatedCategory)) {
                    savedNotes.forEach(note => {
                        if (toUpdateText === note.note) {
                            note.note = updatedText
                            if (updatedCategory) {
                                note.category = updatedCategory
                            }
                            note.favorite = 0
                            localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
                            renderSaved('note')
                            clearInputFields('note')
                            exitEditMode()
                        }
                    })
                } else {
                    alert("You already have this exact note with this exact category")
                }

            } else if (!noteInput.val()) {
                alert("Please, type a note first")

            } else if (!noteCategory.val()) {
                alert("Please, select a category first")

            }
        } else {
        }

    }

    // Function to create a new task
    function createTask(task) {
        const taskListItem = $("<div>").addClass("taskListItem"),
            leftDiv = $("<div>"),
            rightDiv = $("<div>"),
            taskDescription = $("<p>").text(task.task),
            taskCheck = $("<i>").addClass("fa-solid fa-check taskCheck").on("click", () => {
                if (taskDescription.hasClass("checked")) {
                    taskDescription.removeClass("checked")
                    task.check = 0
                    localStorage.setItem("savedTasks", JSON.stringify(savedTasks))
                } else {
                    taskDescription.addClass("checked")
                    task.check = 1
                    localStorage.setItem("savedTasks", JSON.stringify(savedTasks))
                }
            }),
            daysLeft = $("<p>").text(`${task.deadline} days left`),
            taskEdit = $("<i>").addClass("fa-regular fa-pen-to-square taskEdit").on("click", () => {
                editMode = 1
                addUpdateButton.text("Update")
                toUpdateText = task.task
                taskInput.val(task.task)
            }),
            taskTrash = $("<i>").addClass("fa-regular fa-trash-can taskTrash").on("click", () => {
                localStorage.removeItem(task)
                savedTasks = savedTasks.filter(item => item !== task)
                localStorage.setItem("savedTasks", JSON.stringify(savedTasks))
                renderSaved('task')
            });
        if (task.check) {
            taskDescription.addClass("checked")
        }

        rightDiv.append(taskCheck)
        rightDiv.append(taskDescription)
        leftDiv.append(daysLeft)
        leftDiv.append(taskEdit)
        leftDiv.append(taskTrash)
        taskListItem.append(rightDiv)
        taskListItem.append(leftDiv)
        taskList.append(taskListItem)
    }

    // Function to create a new note
    function createNote(note) {
        const noteListItem = $("<div>").addClass("noteListItem"),
            leftDiv = $("<div>"),
            rightDiv = $("<div>"),
            noteDescription = $("<p>").text(note.note),
            noteStar = $("<i>").addClass("fa-regular fa-star noteStar").on("click", () => {
                if (noteStar.hasClass("fa-regular")) {
                    noteStar.removeClass("fa-regular")
                    noteStar.addClass("fa-solid")
                    note.favorite = 1
                    localStorage.setItem("savedNotes", JSON.stringify(savedNotes))
                } else {
                    noteStar.removeClass("fa-solid")
                    noteStar.addClass("fa-regular")
                    note.favorite = 0
                    localStorage.setItem("savedNotes", JSON.stringify(savedNotes))
                }
            }),
            noteCategory = $("<p>").text(note.category),
            noteEdit = $("<i>").addClass("fa-regular fa-pen-to-square noteEdit").on("click", () => {
                editMode = 1
                addUpdateButton.text("Update")
                toUpdateText = note.note
                noteInput.val(note.note)
            }),
            noteTrash = $("<i>").addClass("fa-regular fa-trash-can noteTrash").on("click", () => {
                localStorage.removeItem(note)
                savedNotes = savedNotes.filter(item => item !== note)
                localStorage.setItem("savedNotes", JSON.stringify(savedNotes))
                renderSaved('note')
            });
        if (note.favorite) {
            noteStar.removeClass("fa-regular")
            noteStar.addClass("fa-solid")
        }


        rightDiv.append(noteStar)
        rightDiv.append(noteDescription)
        leftDiv.append(noteCategory)
        leftDiv.append(noteEdit)
        leftDiv.append(noteTrash)
        noteListItem.append(rightDiv)
        noteListItem.append(leftDiv)
        noteList.append(noteListItem)
    }

    // Function to render the tasks or notes stored
    function renderSaved(switching, special) {
        if (switching === 'task') {
            taskList.html('')

            savedTasks.forEach(task => {
                createTask(task)
            })
        } else {
            noteList.html('')

            savedNotes.forEach(note => {
                createNote(note)
            })
        }
    }

    function renderFavorites(switching) {

        if (switching === 'note') {
            noteList.html('')
            savedNotes.forEach(note => {
                if (note.favorite === 1) {
                    createNote(note)
                }
            })
        } else {
            taskList.html('')
            savedTasks.forEach(task => {
                if (task.check === 1) {
                    createTask(task)
                }
            })
        }


    }

    addUpdateButton.on("click", () => {
        if (tasks === 1) {
            addUpdate('task')
        } else {
            addUpdate('note')
        }
    })

    let seeSpecial = 0
    specialDiv.on("click", () => {
        if (seeSpecial === 0) {
            if (tasks === 1) {
                renderFavorites('task')
                seeChecked.text("See all")
            } else {
                renderFavorites('note')
                seeFavorites.text("See all")
            }
            seeSpecial = 1
        } else {
            if (tasks === 1) {
                renderSaved('task')
                seeChecked.text("See checked")
            } else {
                renderSaved('note')
                seeFavorites.text("See favorites")
            }
            seeSpecial = 0
        }
    })

    renderSaved('task')
})