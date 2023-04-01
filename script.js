const URL = 'https://jsonplaceholder.typicode.com';
const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';

const createFullElement = (tagName, classArr, textContent = undefined) => {
   
   const elem = document.createElement(tagName);
   elem.classList.add(...classArr);
      
   if (textContent) {
      elem.textContent = textContent;
   }   

   return elem;
}

const setElementAttribute = (elem, elemName, elemValue) =>{
   elem.setAttribute(`id${elemName}`, elemValue);
   return elem;
}

class Post {
   constructor(userId, title, body){
      this.userId = userId;
      this.title = title;
      this.body = body;
   }
}

const usernameInput = document.getElementById('username');
const btnSearch = document.getElementById('btn-search');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const btnPost = document.getElementById('btn-post');
const postsWrapper = document.getElementById('posts--wrapper');

let findUser;
let postWithComments;

const createPostOnPage = async (post) => {
   const postElem = await createFullElement('div', ['posts--wrapper__post']);
   const postFull = await setElementAttribute(postElem, 'post', post.id);
   await postWithComments.append(postFull);

   const postTitle = await createFullElement('h2', ['post__title'], post.title);
   const postBody = await createFullElement('p', ['post__body'], post.body);
   await postFull.append(postTitle);
   await postFull.append(postBody);

   return postFull;
}

const toggleEditSaveCommentState = (event) => {
   const comment = event.currentTarget;
   const commentId = comment.getAttribute('idcomment');
   const btnClicked = event.target;

   let commentBodyText;

   const currentCommentsWrapper = comment.closest('.comments--wrapper');
   const currentPost = currentCommentsWrapper.previousElementSibling;
   const postId = currentPost.getAttribute('idpost');

   if (btnClicked.classList.contains('comment__edit-btn')) {
                        
      const commentBody = comment.querySelector('.comment__body');
      commentBodyText = commentBody.textContent;
      const commentBodyEdit = createFullElement('textarea', ['comment__body-edit'], commentBodyText);
      commentBody.replaceWith(commentBodyEdit);

      const commentEditBtn = comment.querySelector('.comment__edit-btn');
      const commentSaveBtn = createFullElement('button', ['comment__save-btn'], 'Save');
      commentEditBtn.replaceWith(commentSaveBtn);
   }

   if (btnClicked.classList.contains('comment__save-btn')) {

      const commentBodyEdit = comment.querySelector('.comment__body-edit');
      commentBodyText = commentBodyEdit.value;
      const commentBody = createFullElement('p', ['comment__body'], commentBodyText);
      commentBodyEdit.replaceWith(commentBody);

      const commentSaveBtn = comment.querySelector('.comment__save-btn');
      const commentEditBtn = createFullElement('button', ['comment__edit-btn'], 'Edit');
      commentSaveBtn.replaceWith(commentEditBtn);
   } 

   return {
      commentBodyText: commentBodyText,
      commentId: commentId,
      postId: postId
   };
}

btnSearch.addEventListener('click', async () => {
   if (usernameInput.value) {
      postsWrapper.textContent = '';
      
      const resUsers = await fetch(`${URL}/${USERS}`);
      const users = await resUsers.json();      

      await users.forEach(user => {
         if (user.username === usernameInput.value) {
            findUser = user;
         }
      });

      const resPosts = await fetch(`${URL}/${POSTS}`);
      const posts = await resPosts.json();

      const resComments = await fetch(`${URL}/${COMMENTS}`);
      const comments = await resComments.json();

      postWithComments = createFullElement('div', ['posts--wrapper__post-with-comments']);
      postsWrapper.append(postWithComments);

      findUser.posts = [];
      await posts.forEach(async post => {
         if (post.userId === findUser.id) {
            (findUser.posts).push(post);
            post.comments = [];

            const postFull = await createPostOnPage(post);

            const commentsWrapper = await createFullElement('div', ['comments--wrapper']);
            postFull.after(commentsWrapper);        
            
            await comments.forEach(async comment => {
               if (post.id === comment.postId) {

                  (post.comments).push(comment);

                  const commentElem = await createFullElement('div', ['comments--wrapper__comment']);
                  const commentFull = await setElementAttribute(commentElem, 'comment', comment.id);
                  await commentsWrapper.append(commentFull);

                  const commentName = await createFullElement('p', ['comment__name'], comment.name);
                  const commentBody = await createFullElement('p', ['comment__body'], comment.body);
                  const commentEditBtn = await createFullElement('button', ['comment__edit-btn'], 'Edit');
                  await commentFull.append(commentName);
                  await commentFull.append(commentBody);
                  await commentFull.append(commentEditBtn);

                  commentFull.addEventListener('click', async (event) => {
                     const { commentBodyText, commentId, postId} = toggleEditSaveCommentState(event);
                     
                     console.log('commentId', commentId);
                     console.log('postId', postId);

                     const userPosts = findUser.posts;
                     let commentToUpdate;

                     await userPosts.forEach(async userPost => {

                        if (userPost.id === Number(postId)) {
                           const postComments = userPost.comments;
                           
                           await postComments.forEach(postComment => {
                              if (postComment.id === Number(commentId)) {
                                 postComment.body = commentBodyText;
                                 commentToUpdate = postComment;
                              }
                           })
                        }
                     });                     

                     const res = await fetch(`${URL}/${COMMENTS}/${commentId}`, {
                        method: 'PUT',
                        body: JSON.stringify(commentToUpdate),
                        headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                        }
                     })

                     const serverUpdatedData = await res.json();
                     console.log('serverUpdatedData.body', serverUpdatedData.body);
                     console.log('---------------------');
                     console.log('findUser-2', findUser.posts[postId-1].comments);
                  })
               }
            })
         }         
      }); 
   } 
});

btnPost.addEventListener('click', async () => {
   if (titleInput.value && bodyInput.value) {
      if (findUser) {
         const newPost = new Post(findUser.id, titleInput.value, bodyInput.value);

         const res = await fetch(`${URL}/${POSTS}`, {
            method: 'POST',
            body: JSON.stringify(newPost),
            headers: {
            'Content-type': 'application/json; charset=UTF-8',
            }
         });
         const newPostFromServer = await res.json();

         console.log(newPostFromServer);
         (findUser.posts).push(newPostFromServer);
         await createPostOnPage(newPostFromServer);
      }
      else{
         console.log('enter username and search posts');
      }
   }
})
