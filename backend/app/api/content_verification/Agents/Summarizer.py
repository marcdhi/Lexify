import os
from phi.agent import Agent, RunResponse
from phi.model.google import Gemini
from phi.tools.file import FileTools

from dotenv import load_dotenv
load_dotenv()

def Summarize(filepath):
    # Initialize the Summariser agent with specified model and tools
    Summariser = Agent(
        name="Summariser",
        model = Gemini(id="gemini-2.0-flash-exp", api_key=os.getenv("GOOGLE_API_KEY")),
        debug_mode = True
    )

    # Check if the output directory exists, if not, create it
    revisedFilepath = filepath[0:-9]
    output_dir = f'{revisedFilepath}/output'
    os.makedirs(output_dir, exist_ok=True)

    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
        
    try:
        # Define the refined prompt
        prompt = (
            "Based on the given content : {content}"
            "Identify and summarize the key points, important sentences, and any critical details. "
            "Focus on the main arguments, conclusions, and any significant evidence presented. "
            "Present the summary in a clear and concise manner, highlighting the most relevant information."
        ).format(content=content)

        # Run the Summariser agent with the refined prompt
        run: RunResponse = Summariser.run(prompt)
        
        # Prepare output content
        summary_content = run.content
        
        # Define output file path
        output_filepath = os.path.join(output_dir, 'Summary.txt')
        
        # Write summary to a file in the output directory
        with open(output_filepath, 'w', encoding='utf-8') as output_file:
            output_file.write(summary_content)
        
        return f"Summary written to {output_filepath}"
    
    except Exception as e:
        return f"An error occurred: {e}"