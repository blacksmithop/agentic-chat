import base64

# Function to load and encode images
def get_base64_image(image_path):
    try:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode()
    except:
        return None


# Load icons
bot_icon = get_base64_image("./assets/images/icons/bot.png")
github_icon = get_base64_image("./assets/images/icons/github.png")
system_icon = get_base64_image("./assets/images/icons/system.png")
support_icon = get_base64_image("./assets/images/icons/support.png")
settings_icon = get_base64_image("./assets/images/icons/settings.png")
tools_icon = get_base64_image("./assets/images/icons/tools.png")
user_icon = get_base64_image("./assets/images/icons/user.png")
