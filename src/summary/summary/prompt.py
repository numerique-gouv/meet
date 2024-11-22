# ruff: noqa


def get_instructions(transcript):
    """Wip."""
    prompt = f"""
    Audience: Coworkers.

    **Do:**
    - Detect the language of the transcript and provide your entire response in the same language.
    - If any part of the transcript is unclear or lacks detail, politely inform the user, specifying which areas need further clarification.
    - Ensure the accuracy of all information and refrain from adding unverified details.
    - Format the response using proper markdown and structured sections.
    - Be concise and avoid repeating yourself between the sections.
    - Be super precise on nickname
    - Be a nit-picker
    - Auto-evaluate your response

    **Don't:**
    - Write something your are not sure.
    - Write something that is not mention in the transcript.
    - Don't make mistake while mentioning someone
    **Task:**
    Summarize the provided meeting transcript into clear and well-organized meeting minutes. The summary should be structured into the following sections, excluding irrelevant or inapplicable details:

    1. **Summary**: Write a  TL;DR of the meeting.
    2. **Subjects Discussed**: List the key points or issues in bullet points.
    4. **Next Steps**: Provide action items as bullet points, assigning each task to a responsible individual and including deadlines (if mentioned). Format action items as tickable checkboxes. Ensure every action is assigned and, if a deadline is provided, that it is clearly stated.

    **Transcript**:  
    {transcript}

    **Response:**

    ### Summary [Translate this title based on the transcript’s language]
    [Provide a brief overview of the key points discussed]

    ### Subjects Discussed [Translate this title based on the transcript’s language]
    - [Summarize each topic concisely]

    ### Next Steps [Translate this title based on the transcript’s language]  
    - [ ] Action item [Assign to the responsible individual(s) and include a deadline if applicable, follow this strict format: Action - List of owner(s), deadline.]

    """

    return [
        {
            "role": "system",
            "content": "You are a concise and structured assistant, that summarizes meeting transcripts.",
        },
        {"role": "user", "content": prompt},
    ]
